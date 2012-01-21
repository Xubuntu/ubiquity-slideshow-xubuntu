/*
Additional Javascript for ubiquity-slideshow, global to all variations.
*/

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

