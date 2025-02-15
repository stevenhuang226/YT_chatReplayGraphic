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
	}
	else if (message.action == "setRequestHeadersExample")
	{
		let requestHeaders = JSON.parse(message.requestHeadersExample);
		chatProcesser.setRequestHeadersExample(requestHeaders);
	}
	else if (message.action == "addComments")
	{
		chatProcesser.commentsCounter(JSON.parse(message.commentsArray));
	}
	else if (message.action == "startRequest")
	{
		testRequest();
	}
})

/* test */
function testRequest()
{
	console.log("start test request");
	browser.runtime.sendMessage({action: "stopAll"});

	chatProcesser.loopRequest();
}

function newChatReplayRequest(requestHeaders, requestBody)
{
	const request = new Request(
		"https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?prettyPrint=false",
		{
			method: "POST",
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
