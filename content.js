browser.runtime.sendMessage({"action": "startListenLiveChatReplay"});
console.log("message sent");

let chatProcesser;

window.addEventListener("beforeunload", () =>
	{
		browser.runtime.sendMessage({"action": "stopAll"});
	}
)

browser.runtime.onMessage.addListener((message, sender) => {
	if (! chatProcesser)
	{
		chatProcesser = new chatReplayProcesser(-1);
	}
	console.log(message);
	if (message.action == "chatReplayRequest")
	{
		newChatReplayRequest(message.requestHeaders, message.requestBody);
	}
	else if (message.action == "setContinuation")
	{
		chatProcesser.setContinuation(message.continuation);
	}
	else if (message.action == "setRequestBodyExample")
	{
		let requestBody = JSON.parse(message.requestBodyExample);
		chatProcesser.setRequestBodyExample(requestBody);
		testRequest();
	}
	else if (message.action == "setRequestHeadersExample")
	{
		let requestHeaders = JSON.parse(message.requestHeadersExample);
		chatProcesser.setRequestHeadersExample(requestHeaders);
	}
	else if (message.action == "addComments")
	{
		chatProcesser.commentsCounter(JSON.parse(message.comments));
	}
})

/* test */
function testRequest()
{
	console.log("start test request");
	chatProcesser.testRequest();

	browser.runtime.sendMessage({action: "stopAll"});
}

function newChatReplayRequest(requestHeaders, requestBody)
{
	const request = new Request(
		"https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?prettyPrint=false",
		{
			method: "POST",
			/*
			headers: {
				"X-Goog-Visitor-Id": "CgtOODVWekJVLVhlUSj937W9BjIKCgJUVxIEGgAgIg%3D%3D",
				"X-Youtube-Bootstrap-Logged-In": "false",
				"X-Youtube-Client-Name": "1",
				"X-Youtube-Client-Version": "2.20250212.01.00"
			},
			*/
			headers: requestHeaders,
			body: requestBody
		}
	)

	fetch(request)
		.then(response => {
			console.log(response);
		})
}

/* test end */
