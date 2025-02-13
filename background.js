let listenerAdded = false;
let handlingTabId;

let continuations = [];

let decoder = new TextDecoder("utf-8");
let encoder = new TextEncoder();

let chatProcesser;

/* test variable */
let compareArray = [];
/* end test variable */

browser.runtime.onMessage.addListener((message, sender) =>
	{
		console.log(message); // debug
		if (message.action === "startListenLiveChatReplay")
		{
			chatProcesser = new chatReplayProcesser(sender.tab.id);
			addChatReplayListener(sender.tab.id);
		}
		if (message.action === "stopAll")
		{
			try{
			browser.webRequest.onBeforeRequest.removeListener(chatReplayListener);
			browser.webRequest.onBeforeRequest.removeListener(additionalChatListener);
			browser.webRequest.onBeforeSendHeaders.removeListener(additionalChatReplayHeaderListener);
			}
			catch (error) {console.log(error)};
			chatProcesser.cleanup();
		}
	}
);

function addChatReplayListener(tabId)
{
	handlingTabId = tabId;
	if (listenerAdded === true)
	{
		return;
	}
	listenerAdded = true;
	browser.webRequest.onBeforeRequest.addListener(
		chatReplayListener,
		{"urls": ["https://www.youtube.com/live_chat_replay?continuation=*"]},
		["blocking"]
	)
	browser.webRequest.onBeforeRequest.addListener(
		additionalChatListener,
		{"urls": ["https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?prettyPrint=false"]},
		["blocking", "requestBody"]
	)
	browser.webRequest.onBeforeSendHeaders.addListener(
		additionalChatReplayHeaderListener,
		{"urls": ["https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?prettyPrint=false"]},
		["blocking", "requestHeaders"]
	)
}

async function additionalChatListener(details)
{
	if (details.tabId !== handlingTabId || details.method !== "POST")
	{
		return;
	}

	let filter = browser.webRequest.filterResponseData(details.requestId);

	let chunk = "";
	let data = "";

	filter.ondata = (event) =>
	{
		chunk = decoder.decode(event.data, {stream: true});
		data += chunk;
		filter.write(event.data);
	};
	filter.onstop = async (event) =>
	{
		filter.disconnect();
		console.log("start setting");
		await chatProcesser.setExampleByDetails(details);
		await chatProcesser.setNextContinuationByData(data);
		let comments = await chatProcesser.commentsTime(data);

		browser.tabs.sendMessage(handlingTabId, {
			action: "setContinuation",
			continuation: await chatProcesser.getNextContinuatoin()
		});
		browser.tabs.sendMessage(handlingTabId, {
			action: "setRequestBodyExample",
			requestBodyExample: JSON.stringify(await chatProcesser.getRequestBodyExample())
		});
		browser.tabs.sendMessage(handlingTabId, {
			action: "addComments",
			commentsArray: JSON.stringify(comments)
		});
		//browser.webRequest.onBeforeRequest.removeListener(additionalChatListener);
	};
}

async function additionalChatReplayHeaderListener(details)
{
	if (details.tabId !== handlingTabId || details.method !== "POST")
	{
		return;
	}
	chatProcesser.setExampleHeadersByDetails(details);
	console.log(chatProcesser.getHeadersExample());
	browser.tabs.sendMessage(handlingTabId, {
		action: "setRequestHeadersExample",
		requestHeadersExample: JSON.stringify(chatProcesser.getHeadersExample())
	});
	browser.webRequest.onBeforeSendHeaders.removeListener(additionalChatReplayHeaderListener);
}

function chatReplayListener(details)
{
	/*
	if (details.tabId !== handlingTabId)
	{
		return;
	}
	*/
	let filter = browser.webRequest.filterResponseData(details.requestId);

	let chunk = "";
	let data = "";

	filter.ondata = (event) =>
	{
		chunk = decoder.decode(event.data, {stream: true});
		data += chunk;
		filter.write(event.data);
	};
	filter.onstop = (event) =>
	{
		filter.disconnect();
		//let commentCount = chatProcesser.commentsTime(data); // bug!! TODO new function for the first non json response
		//console.log(commentCount); // debug
		browser.webRequest.onBeforeRequest.removeListener(chatReplayListener);
	};
}

/* test function */
function compareContinuation(details)
{
	let requestBody = JSON.parse(decoder.decode((details.requestBody.raw[0]).bytes));
	let stat = "";
	if (requestBody.continuation == continuations[continuations.length - 1])
	{
		stat = "same as last one";
	}
	else
	{
		stat = "not same as last one";
	}
	console.log(continuations[continuations.length - 1], requestBody.continuation, stat)
}

async function compare(details)
{
	let requestBody = JSON.parse(decoder.decode((details.requestBody.raw[0]).bytes));
	if (compareArray.length === 0)
	{
		compareArray.push(requestBody);
		return;
	}
	let lastRequestBody = compareArray[compareArray.length - 1];
	await compareObject(requestBody, lastRequestBody);
	compareArray.push(requestBody);
}

function setExample(details)
{
	let requestBody = JSON.parse(decoder.decode((details.requestBody.raw[0]).bytes));
	chatProcesser.setRequestBodyExample(requestBody);
}

async function compareObject(obj1, obj2, path = "")
{
	if (Object.keys(obj1) < Object.keys(obj2))
	{
		[obj1, obj2] = [obj2, obj1];
	}
	for (let key in obj1)
	{
		let fullPath = `${path}.${key}` || key;
		if (! (key in obj2))
		{
			console.log(`${fullPath} not found`);
			continue;
		}
		if (typeof obj1[key] === "object" && typeof obj2[key] === "object")
		{
			await compareObject(obj1[key], obj2[key], `${fullPath}.${key}`);
			continue;
		}
		if (obj1[key] !== obj2[key])
		{
			console.log(`${fullPath} different\n${obj1[key]}\n${obj2[key]}`);
			continue;
		}
	}
}

async function dataProcesser(data)
{
	const splitSec = 30;
	const regex = /(?<="timestampText":{"simpleText":")\d{0,4}:*\d{0,8}:*\d{1,8}(?="})/g
	let match = "";

	let subSec = splitSec;
	let commentCount = [];
	let comments = 0;

	while((match = regex.exec(data)) !== null)
	{
		if ((time2Seconds(match[0]) - subSec) < 0)
		{
			comments += 1;
		}
		else
		{
			regex.lastIndex = match.index;
			commentCount.push(comments);
			subSec += splitSec;
			comments = 0;
		}
	}
	commentCount.push(comments);

	console.log(commentCount);

	console.log("first continuation: ", getContinuation(data));
	continuations.push(getContinuation(data));
}
function time2Seconds(textTime)
{
	let parts = textTime.split(":").map(Number);

	if (parts.length === 1)
	{
		return parts[0];
	}
	else if (parts.length === 2)
	{
		return parts[0] * 60 + parts[1];
	}
	else if (parts.length === 3)
	{
		return parts[0] * 3600 + parts[1] * 60 + parts[2];
	}
	return NaN;
}

/* end test function */
