microtime = require("microtime");

function getTimestamp() {
	return microtime.now();
};

function compileInner(setup, stmt) {
	return new Function("limit", "timer", "ctx", 
		"var _i, _t0, _t1; /* setup: */" +
		setup +
		"; gc(); _t0 = timer(); /* loop: */ for(_i=limit; _i; _i--) {" +
		stmt + 
		"}; _t1 = timer(); return (_t1 - _t0)");
};

function Timer(stmt, setup, ctx, timer) {
	this.timer = timer || getTimestamp;
	this.inner = compileInner(setup, stmt);
	this.ctx = ctx || {};	
};

Timer.prototype.timeit = function timeit(number) {
	return this.inner(number || 1000000, this.timer, this.ctx);
};

Timer.prototype.repeat = function repeat(repeat, number) {
	var results = [], i;
	for(i=repeat || 5; i; i--) {
		results.push(this.timeit(number));
	};
	return results;
};

function median(arr) {
	arr.sort();
	return arr[Math.floor(arr.length/2)];
};

/* export the timer */
exports.Timer = Timer;
exports.median = median;
