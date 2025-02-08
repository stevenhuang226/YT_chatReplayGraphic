class chatReplayProcesser
{
	continuation = "";
	playerOffset = 0;
	requestBodyExample;

	constructor(tabId)
	{
		this.isActive = true;
		this.tabId = tabId;
	}

	setContinuation(str)
	{
		console.log("set continuation: ", str);
		this.continuation = str;
		console.log("the continuation: ", this.continuation);
	}
	setRequestBodyExample(obj)
	{
		this.requestBodyExample = structuredClone(obj);
		delete this.requestBodyExample.context.clickTracking;
	}

	newRequest()
	{
	}
	sendToContent()
	{
	}

	cleanup()
	{
		this.isActive = false;
		this.tabId = -1;
	}

	/* test */
	testRequest()
	{
		console.log("try request");
		let requestBody = structuredClone(this.requestBodyExample);
		requestBody.continuation = this.continuation;
		console.log("fake request body: \n", requestBody);
	}
	/* end test */
}
