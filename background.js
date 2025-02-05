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

async function dataProcesser(data)
{
	const splitSec = 30;
	const regex = /(?<="timestampText":{"simpleText":")\d{1,8}:\d{1,8}(?="})/g
	let match = "";

	let subSec = splitSec;
	let commentCount = [];
	let comments = 0;

	while((match = regex.exec(data)) !== null)
	{
		console.log("last index: ", regex.lastIndex);
		console.log("match index: ", match.index)
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

/*
	let matchArray = [];
	matchArray = data.match(regex);
	console.log(matchArray);
	matchArray.forEach((element) => {
		console.log(time2Seconds(element));
	});
/* */
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

function drawOnBar()
{
}
