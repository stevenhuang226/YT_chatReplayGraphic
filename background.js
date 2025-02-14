let listenerAdded = false;
let handlingTabId;

let decoder = new TextDecoder("utf-8");
let encoder = new TextEncoder();

let chatProcesser;

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
	filter.onstop = (event) =>
	{
		filter.disconnect();
		let comments = chatProcesser.commentsTime(data);

		browser.tabs.sendMessage(handlingTabId, {
			action: "setContinuation",
			continuation: getNextContinuationByData(data)
		});
		browser.tabs.sendMessage(handlingTabId, {
			action: "setRequestBodyExample",
			requestBodyExample: JSON.stringify(getRequestBodyByDetails(details))
		});
		browser.tabs.sendMessage(handlingTabId, {
			action: "addComments",
			commentsArray: JSON.stringify(comments)
		});
		setTimeout(() => {
			browser.tabs.sendMessage(handlingTabId, {
				action: "startRequest",
			});
		}, 100);
	};
}

async function additionalChatReplayHeaderListener(details)
{
	if (details.tabId !== handlingTabId || details.method !== "POST")
	{
		return;
	}
	browser.tabs.sendMessage(handlingTabId, {
		action: "setRequestHeadersExample",
		requestHeadersExample: JSON.stringify(getRequestHeadersByDetails(details))
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
		browser.tabs.sendMessage(handlingTabId, {
			action: "addComments",
			commentsArray: JSON.stringify(InitRequestCommentsTime(data))
		})
		browser.webRequest.onBeforeRequest.removeListener(chatReplayListener);
	};
}

function getRequestBodyByDetails(details)
{
	let requestBody = JSON.parse(decoder.decode((details.requestBody.raw[0]).bytes));
	delete requestBody.context.clickTracking;
	return requestBody;
}

function getRequestHeadersByDetails(details)
{
	let headers = {};
	let requestHeaders = details?.requestHeaders;
	if (! headers)
	{
		return null;
	}
	requestHeaders.forEach(element => {
		if (element.name === "X-Goog-Visitor-Id")
		{
			headers["X-Goog-Visitor-Id"] = element.value;
		}
		else if (element.name === "X-Youtube-Bootstrap-Logged-In")
		{
			headers["X-Youtube-Bootstrap-Logged-In"] = element.value;
		}
		else if (element.name === "X-Youtube-Client-Name")
		{
			headers["X-Youtube-Client-Name"] = element.value;
		}
		else if (element.name === "X-Youtube-Client-Version")
		{
			headers["X-Youtube-Client-Version"] = element.value;
		}
	});

	return headers;
}

function getNextContinuationByData(data)
{
	let responseObj = JSON.parse(data);
	let continuation = responseObj?.continuationContents?.liveChatContinuation?.continuations[0]?.liveChatReplayContinuationData?.continuation;

	if (continuation)
	{
		return continuation;
	}
	else
	{
		return null;
	}
}

function InitRequestCommentsTime(data)
{
	const regex = /(?<="timestampText":{"simpleText":")\d{0,4}:*\d{0,8}:*\d{1,8}(?="})/g;
	let matches = (data.match(regex)).map(value => time2Second(value) * 1000);
	return matches;
}

function time2Second(str)
{
	let parts = str.split(":").map(Number);

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
