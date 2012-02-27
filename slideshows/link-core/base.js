/*
Additional Javascript for ubiquity-slideshow, global to all variations.
*/

var INSTANCE_OPTIONS = {
	'locale' : 'en'
};
(function() {
	var parameters = window.location.hash.slice(window.location.hash.indexOf('#') + 1).split('?');
	$.each(parameters, function(i, parameter) {
		hash = parameter.split('=');
		INSTANCE_OPTIONS[hash[0]] = hash[1];
	});
})();

var Signals = new function() {
	var handlers = {};
	
	var register = function(signalName) {
		if (! handlers[signalName]) {
			handlers[signalName] = [];
		}
	}
	
	this.fire = function(signalName, data) {
		if (! handlers[signalName]) register(signalName);
		
		$.each(handlers[signalName], function(index, callback) {
			callback(data);
		});
	}
	
	this.watch = function(signalName, handler) {
		if (! handlers[signalName]) register(signalName);
		
		var signalId = 0;
		signalId = handlers[signalName].push(handler);
		
		return signalId;
	}
	
	this.unwatch = function(signalName, handlerID) {
		if (! handlers[signalName]) register(signalName);
		
		handlers[signalName].splice(handlerID - 1, 1);
	}
}

var parse_locale_code = function(locale) {
	var data = {};
	
	var modifier = locale.split('@', 1);
	data['modifier'] = modifier[1];
	
	var codeset = modifier[0].split('.', 1);
	data['codeset'] = codeset[1];
	
	var territory = codeset[0].split('_', 1);
	data['territory'] = territory[1];
	
	data['language'] = territory[0];
	
	return data;
	
}

