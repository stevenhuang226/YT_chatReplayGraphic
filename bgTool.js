function getRequestBodyByDetails(details)
{
	let requestBody = JSON.parse(decoder.decode((details.requestBody.raw[0]).bytes));
	delete requestBody.context.clickTracking;
	return requestBody;
}

function getRequestHeadersByDetails(details)
{
	let headers = {};
	let requestHeaders = details?.requestHeaders;
	if (! headers)
	{
		return null;
	}
	requestHeaders.forEach(element => {
		if (element.name === "X-Goog-Visitor-Id")
		{
			headers["X-Goog-Visitor-Id"] = element.value;
		}
		else if (element.name === "X-Youtube-Bootstrap-Logged-In")
		{
			headers["X-Youtube-Bootstrap-Logged-In"] = element.value;
		}
		else if (element.name === "X-Youtube-Client-Name")
		{
			headers["X-Youtube-Client-Name"] = element.value;
		}
		else if (element.name === "X-Youtube-Client-Version")
		{
			headers["X-Youtube-Client-Version"] = element.value;
		}
	});

	return headers;
}

function getNextContinuationByData(data)
{
	let responseObj = JSON.parse(data);
	let continuation = responseObj?.continuationContents?.liveChatContinuation?.continuations[0]?.liveChatReplayContinuationData?.continuation;

	if (continuation)
	{
		return continuation;
	}
	else
	{
		return null;
	}
}

function InitRequestCommentsTime(data)
{
	const regex = /(?<="timestampText":{"simpleText":")\d{0,4}:*\d{0,8}:*\d{1,8}(?="})/g;
	let matches = (data.match(regex)).map(value => time2Second(value) * 1000);
	return matches;
}
