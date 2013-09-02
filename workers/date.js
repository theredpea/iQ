
importScripts('base.js');

self.prototype = self.Base;

addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);

retrievePostings = function(args){
		var query = args.query || args[0];


		var regValue = event.data.queryValue instanceof RegExp ?
							event.data.queryValue
							: new RegExp(event.data.queryValue),
			keyMatches = Object.keys(self.invertedindex).filter(function(name){
				return name.match(regValue);
			}),
			resultIds = keyMatches.map(function(key) { return self.invertedindex[key];});

			self.postMessage({results: resultIds});
}	


makeInvertedIndex = function(args){
	var originalIndex = args.originalIndex 	|| args[0] || [],
		reset = 		args.reset 			|| args[1] || false;
		
	if (self.invertedindex && reset)
		//Cache unless args.reset?
		self.postMessage({index: self.invertedindex})

	for (id in originalIndex)
	{
		var iQo = originalIndex[id],
			name = iQo.name;

		self.invertedindex[name] = self.invertedindex[name] || [];
		self.invertedindex[name].push(id);

	}

	self.postMessage({index: self.invertedindex});
}

init = function(args){

	if(!self.initted){

		self.invertedindex = self.invertedindex || {};
		self.cache = self.cache || {};
		self.query = {
			matches : function() {

			}

		};
	}

	self.initted = true;
	self.results = [];
}

