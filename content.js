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
	if (chatProcesser.getDrawedStat())
	{
		drawer.update();
	}
})


/* test  */
function test()
{
	console.log("start test request");
	browser.runtime.sendMessage({action: "stopAll"});
	drawer = new timeLineDrawer();
	chatProcesser.setDrawer(drawer);

	chatProcesser.loopRequest();

}
/* test end */

