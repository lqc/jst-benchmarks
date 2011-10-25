Timer = require("./timeit").Timer;
SETUP = "var a = []; for(var x=0; x < 1000000; x++) a.push(x); var find = ctx.find;";
STMT = "find(a, 123456);"

function find1(arr, e) {
	var i = arr.length;
	for(; i; i--) {
		if(arr[i - 1] == e)
			return true;
	};
	return false;
};

function find2(arr, e) {
	var n = arr.length+1;
	var i = Math.floor(n/2), v;
	while(i > 0 && i <= arr.length) {
		v = arr[i-1];
		if(v == e) {
			return i;
		} 
		else if (v < e) {
			n = i;
			i = Math.floor(i/2);
		}
		else {
			i = Math.ceil((n+i) / 2);
		}
	};
	return -1;
};

function median(arr) {
	arr.sort();
	return arr[Math.floor(arr.length/2)];
};


var timer = new Timer(STMT, SETUP, {"find": find1});
console.log("LINEAR", median(timer.repeat(10, 100)));

var timer = new Timer(STMT, SETUP, {"find": find2});
console.log("BISECT", median(timer.repeat(10, 100000)));