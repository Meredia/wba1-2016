

var Helper = {

	get: function( url, callback ) {
		var xhr = new XMLHttpRequest();

		xhr.onload = function() {
			if(this.readyState === 4) {
				if(typeof(callback) === 'function');
					callback(xhr);
			}
		}

		xhr.open('GET', url);
		xhr.send();
	},

	/*
		Asynchrone Operationen in einer festen Reihenfolge ablaufen lassen

		Bsp.:

		var waterfall = Helper.waterfall();

		waterfall.then(function(value, next) { ... })
				 .then(function(value, next) { ... })
				 .done(function(value) { ... });

		Die Kette wird erst mit einem finalen Aufruf der `done`-Methode durchgegangen.
		Dabei sollte innerhalb jeder Callback-Funktion die `next`-Funktion, mit dem
			neuen Wert als ersten Parameter aufgerufen werden, um diesen der nächsten
			Callback-Funktion weiter zu reichen.

	 */
	waterfall: function() {
		var callbacks = [];

		function traverseCallbacks(callbacks, value, finalCallback) {
			if(callbacks.length > 0) {
				var callback = callbacks.shift();

				callback(value, function(value){
					traverseCallbacks(callbacks, value, finalCallback);
				});
			}
			else {
				finalCallback(value);
			}
		}

		var chainMethods = {
			then: function(callback) {
				callbacks.push(callback);
				return chainMethods;
			},
			done: function(finalCallback) {
				if(callbacks.length > 0)
					traverseCallbacks(callbacks, {}, finalCallback);
			}
		};

		return chainMethods;
	},

	parseHTML: function(html) {
		var tmpElement = document.createElement('div');
		tmpElement.innerHTML = html;

		return tmpElement;
	},


	leftPad: function(num, places, char) {
		num = '' + num;

		if(num.length < places) {
			num = (new Array(places - num.length + 1)).join(char) + num;
		}

		return num;
	}

};