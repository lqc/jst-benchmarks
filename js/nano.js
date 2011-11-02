exports.render = function(template, data) {
	return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
		var keys = key.split("."), value = data[keys.shift()];
		keys.forEach(function(e) {
			value = value[e];
		});
		return (value === null || value === undefined) ? "" : value;
	});
};
