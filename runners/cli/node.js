FS = require("fs");

function main(input) {
	
	var TimeIt = require("../timeit.js");
	var _path_cache = {};
	
	function loadTemplate(path) {
		return FS.readFileSync(path, "utf-8");
	};
	
	function _runner(path, ctx, runner, loader, libs) {
	 	return new TimeIt.TimeIt(
	 		// stmt
	 		"_run(_libs, _tmplt, _ctx);", 
	 		// setup
	 		"var _libs = ctx.libs, _run = ctx.runner, _ctx = ctx.bench_ctx;" +
	 		"var _tmplt = ctx.loader(_libs, ctx.path, ctx.loadTemplate);",
	 		// context 
	 		{ 
	 			"runner": runner,
	 			"loader": loader,
	 			"libs": libs,
	 			"path": path,
	 			"bench_ctx": ctx,
	 			"loadTemplate": loadTemplate,
	 		}
	 	);
	};
	
	function run_benchmark(input) {
		var runner = new Function("libs", "text", "ctx", input.engine.renderer);
		var loader = new Function("libs", "path", "loadTemplate", input.engine.loader || "return loadTemplate(path);");
		/* load libs */
		var libs = input.engine.libs.map(require);
		
		var i, p, result, all_results = [];
		var M = 5, N = 10000;
		result = _runner(input.path, input.context, runner, loader, libs).repeat(M, N);
		var rps = Math.min.apply(this, result.map(function(e) { return e.delta / Math.pow(10, e.precision); }));
		rps = Math.round(N/rps);
		return {
			"name": input.benchmark,
			"times": result,
			"runs_per_sample": N,
			"runs_per_second": rps
		};
	};
	
	return run_benchmark(input);
};

var in_ = '';
process.stdin.on('data', function(chunk) {
	in_ += chunk;
}).on('end', function() {
	var result = main(JSON.parse(in_));
	process.stdout.write(JSON.stringify(result));
	process.stdout.end();
});

process.stdin.resume();