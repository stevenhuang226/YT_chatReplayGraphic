browser.runtime.sendMessage({"action": "startListenLiveChatReplay"});
console.log("message sent");

window.addEventListener("beforeunload", () =>
	{
		browser.runtime.sendMessage({"action": "stopAll"});
	}
)
