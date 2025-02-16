browser.runtime.sendMessage({"action": "startListenLiveChatReplay"});
console.log("message sent");

let chatProcesser;
let drawer;

window.addEventListener("beforeunload", () =>
	{
		browser.runtime.sendMessage({"action": "stopAll"});
	}
)

browser.runtime.onMessage.addListener((message, sender) => {
	if (! chatProcesser)
	{
		chatProcesser = new chatReplayProcesser(-1);
		drawer = new timeLineDrawer();
		drawerTest();
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
	//	testRequest();
	}
})

/* test */
function drawerTest()
{
	drawer.selfTest();
}

function testRequest()
{
	console.log("start test request");
	browser.runtime.sendMessage({action: "stopAll"});

	chatProcesser.loopRequest();
}

/* test end */
