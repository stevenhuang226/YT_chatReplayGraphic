let listenerAdded = false;
let handlingTabId;
browser.runtime.onMessage.addListener((message, sender) =>
	{
		if (message.action === "startListenLiveChatReplay")
		{
			addChatReplayListener(sender.tab.id);
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
	browser.webRequest.onHeadersReceived.addListener(
		chatReplayListener,
		{"urls": ["https://www.youtube.com/live_chat_replay?continuation=*"]},
		["blocking"]
	);
}

function chatReplayListener(details)
{
	/*
	if (details.tabId != handlingTabId) 
	{
		return;
	}
	/* */

	console.log(details);

	let filter = browser.webRequest.filterResponseData(details.requestId);
	let decoder = new TextDecoder("utf-8");
	let encoder = new TextEncoder();

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
		dataProcesser(data);
	};

	listenerAdded = false;
	handlingTabId = -1;
	browser.webRequest.onHeadersReceived.removeListener(chatReplayListener);
}

function dataProcesser(data)
{
	let matchArray = [];
	let regex = /(?<="timestampText":{"simpleText":")\d{1,8}:\d{1,8}(?="})/g
	matchArray = data.match(regex);
	console.log(matchArray);
}
