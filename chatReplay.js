class chatReplayProcesser
{
	playerOffsetSub = 5000;
	splitSec = 30;
	requestInterval = 800;

	isActive = false;
	tabId = -1;

	requestBodyExample;
	requestHeadersExample = {};
	nextContinuation = "";
	playerOffset = 0;

	commentCount = {};
	counterSubTimes = 1;

	decoder = new TextDecoder("utf-8");

	loopRequestCallBack;

	constructor(tabId)
	{
		this.isActive = true;
		this.tabId = tabId;
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
		this.setNextContinuationByObject(responseObj);
	}
	setNextContinuationByObject(obj)
	{
		let continuation = obj?.continuationContents?.liveChatContinuation?.continuations[0]?.liveChatReplayContinuationData?.continuation;

		if (continuation)
		{
			this.nextContinuation = continuation;
		}
		else
		{
			this.nextContinuation = null;
		}
	}
	setLoopRequestCallBack(callback)
	{
		this.loopRequestCallBack = callback;
	}
	commentsTime(data)
	{
		let ytChatAction = JSON.parse(data);
		return this.commentsTimeByObject(ytChatAction);
	}
	commentsTimeByObject(obj)
	{
		let comments = [];
		let actions = obj?.continuationContents?.liveChatContinuation?.actions;
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

		this.setPlayerOffset(commentsMSec[commentsMSec.length - 1] - this.playerOffsetSub);
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
	async newChatReplayRequest()
	{
		let requestBody = structuredClone(this.requestBodyExample);
		requestBody.continuation = this.nextContinuation;
		requestBody.currentPlayerState.playerOffsetMs = this.playerOffset;

		const request = new Request(
			"https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?prettyPrint=false",
			{
				method: "POST",
				headers: this.requestHeadersExample,
				body: JSON.stringify(requestBody)
			}
		);
		const response = await fetch(request);
		if (! response.ok)
		{
			console.error("new chat replay request failed");
			this.isActive = false;
			return;
		}
		const responseObj = await response.json();
		this.setNextContinuationByObject(responseObj);
		this.commentsCounter(this.commentsTimeByObject(responseObj));
		return;
	}

	async loopRequest()
	{
		await new Promise(resolve => {
			setTimeout(resolve, this.requestInterval);
		});
		console.log("new request"); // debug
		await this.newChatReplayRequest();
		if (this.isActive === true && this.nextContinuation !== null)
		{
			this.loopRequest();
		}
		else
		{
			this.loopRequestCallBack();
		}
	}

	cleanup()
	{
		this.isActive = false;
		this.tabId = -1;
	}
}
