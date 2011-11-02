/*
 * Basic timer.
 */
;(function() {
	/* Do some checks */
	try {
		window;
		is_browser = true;
		var _exports = window;
	} catch(e) {
		is_browser = false;
		var _exports = exports;
	};
	
	var is_browser, has_exports, Timer = null;
	
	/* Some timers */
	function BaseTimer() {
		this._started = null; 
	};
	
	BaseTimer.prototype.start = function() {
		this.started = this.now();
		this.stoped = 0;
	}
	
	BaseTimer.prototype.stop = function() {
		this.stoped = this.now();
	}
	
	BaseTimer.prototype.interval = function() {
		// millisecond precision
		return {"delta": (this.stoped - this.started), "precision": this.precision};
	}
	
	function NodeTimer() {
		var _microtime = require("microtime");
		this.precision = 6;
		this.now = _microtime.now; 
	};
	NodeTimer.prototype = BaseTimer.prototype;
	
	function DateTimer() {
		this.precision = 3;
		this.now = Date.now;
	};
	DateTimer.prototype = BaseTimer.prototype;

	if(is_browser) {
	    if(window.chrome && window.chrome.Interval) {
		   var Timer = window.chrome.Interval;
		   Timer.prototype.interval = function() {
		       return {"delta": this.microseconds(), "precision": 6};
		   };
	    };
	} 
	else {
		var Timer = NodeTimer;
	};

	_exports.Timer = Timer || DateTimer;
	
	/**
	 * Generic timing routine. 
	 */
	function compileInner(setup, stmt) {
		return new Function("limit", "timer", "ctx", "gc", 
			"var _i; /* setup: */" +
			setup +
			"; gc(); timer.start(); /* loop: */ for(_i=limit; _i; _i--) {" +
			stmt + 
			"}; timer.stop(); return timer.interval();");
	};

	function TimeIt(stmt, setup, ctx, timer) {
		this.timer = new (timer || Timer)();
		this.inner = compileInner(setup, stmt);
		this.ctx = ctx || {};
		try {
			gc();
			this.gc_ = gc;
		} catch(e) {
			this.gc_ = function() {};
		};
	};

	TimeIt.prototype.timeit = function timeit(number) {
		return this.inner(number || 1000000, this.timer, this.ctx, this.gc_);
	};

	TimeIt.prototype.repeat = function repeat(repeat, number) {
		var results = [], i;
		for(i=repeat || 5; i; i--) {
			results.push(this.timeit(number));
		};
		return results;
	};
	
	_exports.TimeIt = TimeIt;
})();
