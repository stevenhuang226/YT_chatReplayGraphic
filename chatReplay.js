class chatReplayProcesser
{
	constructor(tabId)
	{
		this.isActive = true;
		this.tabId = tabId;
		this.continuation = "";
		this.playerOffset = 0;
		this.requestBodyExample;
	}

	setContinuation(str)
	{
		this.continuation = str;
	}
	setPlayerOffset(playerOffset)
	{
		this.playerOffset = playerOffset;
	}
	setRequestBodyExample(obj)
	{
		this.requestBodyExample = structuredClone(obj);
		delete this.requestBodyExample.context.clickTracking;
	}

	commentsTime(data)
	{
		let ytChatAction = JSON.parse(data);
		if (ytChatAction.continuationContents.liveChatContinuation.actions === undefined)
		{
			return [];
		}

		let commentCount = [];
		let actions = ytChatAction.continuationContents.liveChatContinuation.actions;
		actions.forEach((element, index) => {
			if (! element.replayChatItemAction?.videoOffsetTimeMsec)
			{
				return;
			}
			console.log(element.replayChatItemAction?.videoOffsetTimeMsec);
		})
	}

	cleanup()
	{
		this.isActive = false;
		this.tabId = -1;
	}

	/* test */
	testRequest()
	{
		let requestBody = structuredClone(this.requestBodyExample);
		requestBody.continuation = this.continuation;
		console.log("fake request body: \n", requestBody);
	}
	/* end test */
}

function requestNewChatReplay(that)
{
	if (that.isActive === false)
	{
		return;
	}

	let requestBody = structuredClone(that.requestBodyExample);
	requestBody.continuation = that.continuation;
	requestBody.currentPlayerState.playerOffsetMs = that.playerOffset // set the current player off set


	const request = new Request(
		"",
		{
			method: "POST",
			headers: {},
			body: JSON.stringify(requestBody)
		}
	)

	fetch(request)

	// check include continuation
	// check the last comment time
}

/* I have no idea why it herer
element.replayChatitemAction.actions.addChatitemAction.item.liveChatTextMessageRenderer.timestampText.simpleText
time2Seconds(element.replayChatitemAction.actions[0].addChatitemAction.item.liveChatTextMessageRenderer.timestampText.simpleText);
			if (! element.replayChatItemAction?.actions[0].addChatItemAction?.item?.liveChatTextMessageRenderer?.timestampText?.simpleText)
			{
				return;
			}
			let time = time2Seconds(element.replayChatItemAction.actions[0].addChatItemAction.item.liveChatTextMessageRenderer.timestampText.simpleText);
			console.log(time);
/* */
