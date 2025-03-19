class YThtmlBgListener
{
	regex = /(?<=","lengthSeconds":")\d+(?=","channelId)/;
	buffTabId = -1;
	tabId2VideoLen = {};

	listener(details)
	{
		if (details.tabId > 0)
		{
			this.buffTabId = details.tabId;
		}

		let filter = browser.webRequest.filterResponseData(details.requestId);

		let data = "";

		filter.ondata = (event) =>
		{
			data += decoder.decode(event.data, {stream: true});
			filter.write(event.data);
		};
		filter.onstop = (event) =>
		{
			filter.disconnect();
			this.matchVideoLength(data);
		}
	}

	matchVideoLength(data)
	{
		let videoLength = data.match(this.regex)[0];

		if (videoLength <= 0)
		{
			return;
		}
		this.tabId2VideoLen[this.buffTabId] = parseInt(videoLength);
	}

	getVideoLen(tabId)
	{
		if (! this.tabId2VideoLen[tabId])
		{
			return;
		}
		return this.tabId2VideoLen[tabId];
	}

	resetVideoLen(tabId)
	{
		if (! this.tabId2VideoLen[tabId])
		{
			return;
		}
		this.tabId2VideoLen[tabId] = -1;
	}

	sendToTab(tabId)
	{
		if (! this.tabId2VideoLen[tabId])
		{
			return;
		}
		browser.tabs.sendMessage(tabId, {
			action: "setVideoLength",
			videoLength: this.tabId2VideoLen[tabId]
		});
	}
}
