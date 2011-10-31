jQuery(document).ready(function($) {
	var reader = new FileReader();
	
	function format_data_by_benchmark(suite) {
		var i, j, sample, result;
		var samples = [];
		for(i=0; i < suite.length; i++) {
			var sample = suite[i];
			var data = [];
			samples.push({
				"label": sample.engine,
				"bars": { show: true},
				"data": data
			});
			for(j=0; j < sample.results.length; j++) {
				var times = sample.results[j];
				data.push([1+i+(suite.length+1)*j, times.runs_per_second/1000]);	
			};
		};
		return samples;
	};
	
	function tests_ticks(suite) {
		var n = suite.length+1;
		return suite[0].results.map(function(e, i) {
			return [1+i*n+Math.floor(n/2), e.name];
		});
	};
	
	reader.onload = function(evt) {
		$('#statusbar').text("Data loaded.");
		// plot new data
		try {
			var parsed_data = JSON.parse(evt.target.result);
		} catch(e) {
			$('#statusbar').text("Failed to parse data: " + e.toString());
			return;
		}
		$.plot($("#placeholder"), format_data_by_benchmark(parsed_data), {
			"xaxis": {
				autoscaleMargin: 1,
				ticks: tests_ticks(parsed_data)
			}
		});
		
		$('#statusbar').text("");
	};
	
	reader.onerror = function(evt) {
		$('#statusbar').text("Failed to load data");
	};
	
	$('#load_button').click(function() {
		var loader = $('#loader').get(0);
		if(!loader.files.length) {
			alert("No file selected!");
		};
		$('#statusbar').text("Loading data...");
		reader.readAsText(loader.files[0]);
	});
	
});
