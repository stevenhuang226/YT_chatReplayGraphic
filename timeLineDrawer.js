class timeLineDrawer
{
	progressBar;
	barContainer;
	progressBarLength;

	splitGroup = [];
	commentCount = {};
	divArray = [];

	commentToPixel = 1;
	bgColor = "blue";

	constructor()
	{
		this.progressBar = document.getElementsByClassName("ytp-progress-bar-container")[0];
		this.barContainer = this.progressBar;
		this.progressBarLength = this.progressBar.clientWidth;
	}
	setCommentCount(comments)
	{
		this.commentCount = structuredClone(comments);
	}

	update()
	{
		this.progressBarLength = this.progressBar.clientWidth;
		this.drawGraphic();
	}

	splitPx()
	{
		let nums = Object.keys(this.commentCount).length;
		let numsGroup = [];
		let split = parseInt(this.progressBarLength / nums);
		let addUnit = (this.progressBarLength / nums) - split;
		let addLength = addUnit;
		for (let i = 0; i < nums; ++i)
		{
			if (addLength >= 1)
			{
				numsGroup.push(split + 1);
				--addLength;
			}
			else
			{
				numsGroup.push(split);
			}
			addLength += addUnit;
		}
		this.splitGroup = structuredClone(numsGroup);
	}
	drawGraphic()
	{
		this.cleanGraphic();
		this.splitPx();
		let commentsArray = Object.values(this.commentCount);
		let index = 0;
		for (let commentNum of commentsArray)
		{
			this.drawBar(this.splitGroup[index], commentNum * this.commentToPixel);
			++index;
		}
	}
	drawBar(width, height)
	{
		let element = document.createElement("DIV");
		element.style.width = String(width) + "px";
		element.style.height = (height > 0) ? String(height) + "px" : "1px";
		element.style.backgroundColor = this.bgColor;
		element.style.float = "left";
		if (height === 0)
		{
			element.style.visibility = "hidden";
		}
		this.barContainer.appendChild(element);
		this.divArray.push(element);
	}
	cleanGraphic()
	{
		this.divArray.forEach(element => {
			element.remove();
		});
	}

	cleanup()
	{
		console.log("exit");
	}
};
