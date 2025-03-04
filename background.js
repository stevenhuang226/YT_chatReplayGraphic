let listenerAdded = false;
let handlingTabId;

let decoder = new TextDecoder("utf-8");
let encoder = new TextEncoder();
let YTbgListener = new YThtmlBgListener();

let chatProcesser;

let stopAll = true;

browser.webRequest.onBeforeRequest.addListener(
	YThtmlListener,
	{"urls": ["https://www.youtube.com/watch?v=*"]},
	["blocking"]
)

browser.runtime.onMessage.addListener((message, sender) =>
	{
		if (message.action === "startListenLiveChatReplay")
		{
			stopAll = false;
			chatProcesser = new chatReplayProcesser(sender.tab.id);
			addChatReplayListener(sender.tab.id);
			YTbgListener.sendToTab(sender.tab.id);
		}
		if (message.action === "stopAll")
		{
			handlingTabId = -1;
			stopAll = true;
			chatProcesser.cleanup();
			tabId2videoLen[sender.tab.id] = -1;
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

function additionalChatListener(details)
{
	if (details.tabId !== handlingTabId || details.method !== "POST" || stopAll === true)
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

function additionalChatReplayHeaderListener(details)
{
	if (details.tabId !== handlingTabId || details.method !== "POST" || stopAll === true)
	{
		return;
	}
	browser.tabs.sendMessage(handlingTabId, {
		action: "setRequestHeadersExample",
		requestHeadersExample: JSON.stringify(getRequestHeadersByDetails(details))
	});
}

function chatReplayListener(details)
{
	if (stopAll === true)
	{
		return;
	}
	let filter = browser.webRequest.filterResponseData(details.requestId);

	let data = "";

	filter.ondata = (event) =>
	{
		data += decoder.decode(event.data, {stream: true});
		filter.write(event.data);
	};
	filter.onstop = (event) =>
	{
		filter.disconnect();
		browser.tabs.sendMessage(handlingTabId, {
			action: "initAddComments",
			commentsArray: JSON.stringify(InitRequestCommentsTime(data))
		});
	};
}

function YThtmlListener(details)
{
	YTbgListener.listener(details);
}
