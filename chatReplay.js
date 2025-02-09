class chatReplayProcesser
{
	playerOffsetSub = 5000;
	splitSec = 30;

	isActive = false;
	tabId = -1;
	nextContinuation = "";
	playerOffset = 0;
	requestBodyExample;
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
		this.playerOffset = playerOffset;
	}
	setRequestBodyExample(obj)
	{
		this.requestBodyExample = structuredClone(obj);
		delete this.requestBodyExample.context.clickTracking;
	}
	setExampleByDetails(details)
	{
		this.setRequestBodyExample(JSON.parse(this.decoder.decode((details.requestBody.raw[0]).bytes)))
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

	startLoopRequest()
	{

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
		let requestBody = structuredClone(this.requestBodyExample);
		requestBody.continuation = this.nextContinuation;
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
	requestBody.continuation = that.nextContinuation;
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
		.then(response => {
		})

	// check include continuation
	// check the last comment time (trought data into commentsTime)
}

function getContinuation(data)
{
	const regex = /(?<=,"continuation":").*?(?=")/g
	let match = [];
	match = data.match(regex);
	return match[0] || null;
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
