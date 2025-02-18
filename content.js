browser.runtime.sendMessage({"action": "startListenLiveChatReplay"});
console.log("message sent");

let chatProcesser;
let drawed = false;
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
	}
	if (! drawer)
	{
		drawer = new timeLineDrawer();
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
		test();
	}
})

window.addEventListener("resize", () => {
	if (drawed)
	{
		drawer.update();
	}
});

function startRequest()
{
	browser.runtime.sendMessage({action: "stopAll"});
	chatProcesser.setLoopRequestCallBack(finishDraw);
	chatProcesser.loopRequest();
}
function finishDraw()
{
	drawed = true;
	drawer.setCommentCount(chatProcesser.getCommentCount());
	drawer.drawGraphic();
}
