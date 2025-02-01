let listenerAdded = false;
let handlingTabId;
browser.runtime.onMessage.addListener((message, sender) => {
	if (message.action === "startListenLiveChatReplay" && ! listenerAdded) {
		addChatReplayListener();
		listenerAdded = true;
		handlingTabId = sender.tab.id;
	}
	else if (message.action === "stopListenLiveChatReplay") {
		removeChatReplayListener();
		listenerAdded = false;
		handlingTabId = -1;
	}
});

function addChatReplayListener() {
	browser.webRequest.onBeforeRequest.addListener(
		chatReplayListener(details),
		{urls: ["*://www.youtube.com/live_chat_replay?continuation=*"]},
		["blocking"]
	);
}

async function chatReplayListener(details) {
}
