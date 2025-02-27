

function time2Second(str)
{
	let parts = str.split(":").map(Number);

	if (parts.length === 1)
	{
		return parts[0];
	}
	else if (parts.length === 2)
	{
		return parts[0] * 60 + parts[1];
	}
	else if (parts.length === 3)
	{
		return parts[0] * 3600 + parts[1] * 60 + parts[2];
	}
	return NaN;
}
