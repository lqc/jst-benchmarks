jQuery(function($) {
	var Config = null;
	var __taskid = 0;
	var _sched_queue = [];
	var _running_tasks = {};
	
	function log(message, cls) {
		var cls = cls || '';
		$('#console').append("<div class='" + cls + "'>" + message + "</div>");		
	};
	
	var panel_t = Handlebars.compile($("#panel-template").html());
	
	Handlebars.registerHelper('eachKV', function(context, block) {
  		var ret = "";
  		for(var k in context) {
    		ret += block({"key": k, "value": context[k]});
  		};
  		return ret;
	});
	
	function obj_keys(obj) {
		var a = [];
		for(var k in obj) a.push(k);
		return a;
	}
	
	function gen_taskid() {
		__taskid += 1;
		return (+new Date()) + "-" + __taskid;
	}
	
	var __task_runner = null;
	
	function execute_schedule() {
		if(__task_runner || !_sched_queue.length)
			return;
		__task_runner = $("<iframe style='width: 1px; height: 1px;' src='/runners/browser/iframe.html'></iframe>");
		__task_runner.appendTo('body');
	};
	
	window.addEventListener("message", function(evt) {
		var task;
		// new iframe is ready
		switch(evt.data.type)
		{
			case "ready":
				if(!_sched_queue.length) {
					throw new Error("Frame ready, but no tasks.");
				};
				task = _sched_queue.shift();
				
				// send the task
				_running_tasks[task.taskid] = task;
				task.status = "RUNNING";
				var x = $.extend({}, task, {"callback": null});
				evt.source.postMessage(x, window.location.origin);
				console.log("Task running", task.taskid);
				break;
			case "done":
				__task_runner.remove();
				__task_runner = null;
				task = _running_tasks[evt.data.taskid];
				delete _running_tasks[evt.data.taskid];
				
				console.log("Task completed", task.taskid, evt.data.engine_name, evt.data.benchmark);
				task.callback.call(task, evt.data);
				
				// continue executing until queue is empty
				execute_schedule();
				break;
			case "log":
				log.apply(this, evt.data.message);
				break;
		};
	}, false);
	
	/* The actual runner */
	function run_benchmark(ename, edef, callback) {
		log('Running benchmarks for "' + ename + '"...', 'ongoing');
		var taskid, done = Config.syntaxes[edef.syntax].tests.length, results = [];
		
		Config.syntaxes[edef.syntax].tests.map(function(testcase) {
			if(typeof testcase === "string") {
				var testname = testcase;
				var context = {};
			}
			else {
				var testname = testcase[0];
				var context = testcase[1];
			};
			_sched_queue.push({
				"taskid": gen_taskid(), 
				"engine_name": ename, 
				"engine": edef, 
				"benchmark": testname,
				"path": "/inputs/" + edef.syntax + "/" + testname,
				"context": context,
				"callback": function check_completed(result) {
					done--;
					results.push(result);
					if(done === 0) {
						callback(results);
					}
				},
				"status": "SCHEDULED"
			});
		});
		execute_schedule();
	};
	
	function run_benchmark_queue(queue, callback, acc) {
		var acc = acc || [];
		if(!queue.length) {
			if(callback) 
				callback(acc.reduce(function(a,b) { return a.concat(b); }));
			return;
		};
		
		var engine_name = queue.shift();
		run_benchmark(engine_name, Config.engines[engine_name], function(result) {
			log("done.", "success");
			// we don't need the iframe anymore
			$('iframe#task_'+ this.taskid).remove();
			acc.push(result);
			run_benchmark_queue(queue, callback, acc);
		});
	};
	
	/* Panel handler */
	$('#controlpanel').delegate('#run_button', 'click', function() {
		var selected = $('#controlpanel input:checked').map(function() { 
			return this.value; 
		}).get();
		
		if(!selected.length) {
			log("No engine selected", "error");
			return;
		};
		
		run_benchmark_queue(selected, function(results) {
			log("<pre>" + JSON.stringify(results, null, "  ") + "</pre>");
			$("#console").scrollTop(9e9);
		});
	});

	/* Main */
	log("Loading config...", 'ongoing');
	$.ajax({
		url: '/bench_config.json',
		dataType: 'json',
		success: function(data) {
			Config = data;
			log("done.", 'success');
			log("Availble engines: " + obj_keys(data.engines).join(', '));
			$('#controlpanel').html(panel_t(data));
		},
		failure: function(xhr) {
			log("Load failed", "error");
		}
	});
});
