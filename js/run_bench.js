FS = require("fs");

function main(input) {
	
	var TimeIt = require("./timeit");
	var _path_cache = {};
	
	function loadTemplate(path) {
		return FS.readFileSync(path, "utf-8");
	};
	
	function _runner(path, ctx, runner, loader, lib) {
	 	return new TimeIt.Timer(
	 		"_run(_lib, _tmplt, _ctx);", 
	 		"var _lib = ctx.lib, _run = ctx.runner, _ctx = ctx.bench_ctx;" +
	 		"var _tmplt = ctx.loader(_lib, ctx.path, ctx.loadTemplate);", 
	 		{ 
	 			"runner": runner,
	 			"loader": loader,
	 			"lib": lib,
	 			"path": path,
	 			"bench_ctx": ctx,
	 			"loadTemplate": loadTemplate,
	 		}
	 	);
	};
	
	function run_benchmark(input) {
		var runner = new Function("lib", "text", "ctx", input.engine.renderer);
		var loader = new Function("lib", "path", "loadTemplate", input.engine.loader || "return loadTemplate(path);");
		var lib = require(input.engine.lib)
		var i, p, result, all_results = [];
		var M = 9, N = 500000;
		result = _runner(input.path, {}, runner, loader, lib).repeat(M, N);
		return {
			"name": input.benchmark,
			"times": result,
			"runs_per_sample": N,
			"runs_per_second": Math.round((N * 1000000)/ Math.min.apply(this, result))
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