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
		this.progressBarLength = this.progressBar.length;
		this.drawGraphic();
	}

	/* test */
	async selfTest()
	{
		console.log(this.progressBar);
		console.log(typeof this.progressBar);

		if (this.progressBar instanceof HTMLElement)
		{
			console.log("valid DOM");
		}
		else
		{
			console.log("not valid DOM");
		}

		let num1 = document.createElement("div");
		num1.style.width = "100px";
		num1.style.height = "10px";
		num1.style.backgroundColor = "blue";
		this.progressBar.appendChild(num1);

		console.log(num1);
	}

	async testDraw()
	{
		this.splitPx();
		let commentsArray = Object.values(this.commentCount);
		let index = 0;
		for (let commentsNum of commentsArray)
		{
			await this.testBar(this.splitGroup[index], commentsNum * this.commentToPixel);
			++index;
		}
	}

	async testBar(width, height)
	{
		console.log(width, "x", height);
		let div = document.createElement("div");
		div.style.width = String(width) + "px";
		div.style.height = String(height) + "px";
		div.style.backgroundColor = "blue";
		div.style.float = "left";
		this.progressBar.appendChild(div);
		this.divArray.push(div);
		return;
	}
	async removeDiv()
	{
		this.dirArray.forEach(element => {
			element.remove();
		});
		return;
	}
	/* test end*/

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
		element.style.height = String(height) + "px";
		element.style.backgroundColor = this.bgColor;
		element.style.float = "left";
		this.barContainer.appendChild(element);
		this.divArray.push(element);
	}
	cleanGraphic()
	{
		this.dirArray.forEach(element => {
			element.remove();
		});
	}

	cleanup()
	{
		console.log("exit");
	}
};
