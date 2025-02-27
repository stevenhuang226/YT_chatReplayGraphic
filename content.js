browser.runtime.sendMessage({"action": "startListenLiveChatReplay"});

let initCommentsAdded = false;

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
		getVideoTime();
	}
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
	else if (message.action == "initAddComments")
	{
		if (initCommentsAdded)
		{
			return;
		}
		initCommentsAdded = true;
		chatProcesser.commentsCounter(JSON.parse(message.commentsArray));
	}
	else if (message.action == "startRequest")
	{
		startRequest();
		browser.runtime.sendMessage({"action": "stopAll"});
	}
})

window.addEventListener("resize", redrawGraphic);
window.addEventListener("fullscreenchange", redrawGraphic);

async function redrawGraphic()
{
	if (! drawed)
	{
		return;
	}
	await new Promise(resolve => {
		setTimeout(resolve, 500);
	});
	drawer.update();
}

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
	chatProcesser.cleanup();
}
function getVideoTime()
{
	let videoTimeText = document.getElementsByClassName("ytp-time-duration")[0];
	console.log("video time:", videoTimeText.innerHTML);
	console.log("video s:", time2Second(videoTimeText.innerHTML));
}
function cleanGraphic()
{
	if (! drawer)
	{
		return;
	}
	drawer.cleanGraphic();
}
