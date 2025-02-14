class chatReplayProcesser
{
	playerOffsetSub = 5000;
	splitSec = 30;

	isActive = false;
	tabId = -1;
	nextContinuation = "";
	playerOffset = 0;
	requestBodyExample;
	requestHeadersExample = {};
	commentCount = {};

	counterSubTimes = 1;

	decoder = new TextDecoder("utf-8");

	constructor(tabId)
	{
		this.isActive = true;
		this.tabId = tabId;
	}

	setContinuation(str)
	{
		this.nextContinuation = str;
	}
	setPlayerOffset(playerOffset)
	{
		this.playerOffset = String(playerOffset);
	}
	setRequestBodyExample(obj)
	{
		this.requestBodyExample = structuredClone(obj);
		delete this.requestBodyExample.context.clickTracking;
	}
	setRequestHeadersExample(obj)
	{
		this.requestHeadersExample = structuredClone(obj);
	}
	setNextContinuationByData(data)
	{
		let responseObj = JSON.parse(data);
		let continuation = responseObj?.continuationContents?.liveChatContinuation?.continuations[0]?.liveChatReplayContinuationData?.continuation;

		if (continuation)
		{
			this.nextContinuation = continuation;
		}
		else
		{
			this.nextContinuation = null;
		}
	}
	getRequestBodyExample()
	{
		return this.requestBodyExample;
	}
	getRequestHeadersExample()
	{
		return this.requestHeadersExample;
	}
	getNextContinuatoin()
	{
		return this.nextContinuation;
	}
	getPlayerOffset()
	{
		return this.playerOffset;
	}
	getCommentCount()
	{
		return this.commentCount;
	}

	commentsTime(data)
	{
		let ytChatAction = JSON.parse(data);
		let comments = [];
		let actions = ytChatAction?.continuationContents?.liveChatContinuation?.actions;
		if (! actions)
		{
			return [];
		}
		actions.forEach((element, index) => {
			let commentMsec = element.replayChatItemAction?.videoOffsetTimeMsec;
			if (! commentMsec)
			{
				return;
			}
			commentMsec = parseInt(commentMsec);
			comments.push(commentMsec);
			if (index === actions.length - 1)
			{
				this.playerOffset = commentMsec - this.playerOffsetSub;
			}
		});

		return comments;
	}

	commentsCounter(commentsMSec)
	{
		const splitMSec = this.splitSec * 1000;
		let comments = 0;
		for (let index = 0; index < commentsMSec.length; ++index)
		{
			if ((commentsMSec[index] - splitMSec * this.counterSubTimes) < 0)
			{
				++comments;
			}
			else
			{
				this.addCounterNum(comments);
				--index;
				++this.counterSubTimes;
				comments = 0;
			}
		}
		this.addCounterNum(comments);
		--this.counterSubTimes;
	}

	addCounterNum(num)
	{
		let secGroup = this.commentCount[this.splitSec * this.counterSubTimes];
		if (! secGroup)
		{
			this.commentCount[this.splitSec * this.counterSubTimes] = num;
		}
		else
		{
			this.commentCount[this.splitSec * this.counterSubTimes] = secGroup + num;
		}
	}

	cleanup()
	{
		this.isActive = false;
		this.tabId = -1;
	}

	/* test */
	testRequest()
	{
		requestNewChatReplay(this);
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
	requestBody.continuation = that.nextContinuation;
	requestBody.currentPlayerState.playerOffsetMs = String(that.playerOffset);

	const request = new Request(
		"https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?prettyPrint=false",
		{
			method: "POST",
			headers: that.requestHeadersExample,
			body: JSON.stringify(requestBody)
		}
	)

	fetch (request)
		.then((response) => {
			console.log(response);
		});


	/*
	browser.tabs.sendMessage(that.tabId, {
		"action": "chatReplayRequest",
		"requestHeaders": JSON.stringify()
		"requestBody": JSON.stringify(requestBody)
	})
	*/
	// check include continuation
	// check the last comment time (trought data into commentsTime)
}
/* I have no idea why it here
element.replayChatitemAction.actions.addChatitemAction.item.liveChatTextMessageRenderer.timestampText.simpleText
time2Seconds(element.replayChatitemAction.actions[0].addChatitemAction.item.liveChatTextMessageRenderer.timestampText.simpleText);
			if (! element.replayChatItemAction?.actions[0].addChatItemAction?.item?.liveChatTextMessageRenderer?.timestampText?.simpleText)
			{
				return;
			}
			let time = time2Seconds(element.replayChatItemAction.actions[0].addChatItemAction.item.liveChatTextMessageRenderer.timestampText.simpleText);
			console.log(time);
/* */
