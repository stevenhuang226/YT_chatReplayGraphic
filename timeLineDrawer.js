class timeLineDrawer
{
	progressBar;

	constructor()
	{
		this.progressBar = document.getElementsByClassName("ytp-progress-bar-container");
	}

	/* test */
	selfTest()
	{
		console.log(this.progressBar);

		let num1 = document.createElement("div");
		num1.style.width = "100px";
		num1.style.height = "10px";
		num1.backgroundColor = "blue";
		this.progressBar.appendChild(num1);

		console.log(num1);
	}
	/* test end*/

	cleanup()
	{
		console.log("exit");
	}
};
