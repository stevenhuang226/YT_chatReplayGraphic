browser.runtime.sendMessage({"action": "startListenLiveChatReplay"});
console.log("message sent");

window.addEventListener("beforeunload", () =>
	{
		browser.runtime.sendMessage({"action": "stopAll"});
	}
)

browser.runtime.onMessage.addListener((message, sender) => {
	if (message.action == "chatReplayRequest")
	{
		newChatReplayRequest(message.requestBody);
	}
})

function newChatReplayRequest(requestBody)
{
	const request = new Request(
		"https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?prettyPrint=false",
		{
			method: "POST",
			headers: {
				"X-Goog-Visitor-Id": "CgtOODVWekJVLVhlUSj937W9BjIKCgJUVxIEGgAgIg%3D%3D",
				"X-Youtube-Bootstrap-Logged-In": "false",
				"X-Youtube-Client-Name": "1",
				"X-Youtube-Client-Version": "2.20250212.01.00"
			},
			body: requestBody
		}
	)

	fetch(request)
		.then(response => {
			console.log(response);
		})
}
