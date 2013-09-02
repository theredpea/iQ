
importScripts('base.js');

self.prototype = self.Base;
//throw (JSON.stringify(self.Base.onMessage) || String(self.Base.onMessage));

addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);

/*
function onMessage(event)
{
	self.init();
	var method = event.data.method;
	if (method in self)
	{
		self[method](event.data.args)
	}

}*/

retrievePostings = function(args){
		var query = args.query || args[0];


		var regValue = event.data.queryValue instanceof RegExp ?
							event.data.queryValue
							: new RegExp(event.data.queryValue),
			keyMatches = Object.keys(self.index).filter(function(name){
				return name.match(regValue);
			}),
			resultIds = keyMatches.map(function(key) { return self.index[key];});

			self.postMessage({results: resultIds});
}	


makeInvertedIndex = function(args){
	var originalIndex = args.originalIndex 	|| args[0] || [],
		reset = 		args.reset 			|| args[1] || false;
		
	if (self.index && reset)
		//Cache unless args.reset?
		self.postMessage({index: self.index})

	for (id in originalIndex)
	{
		var iQo = originalIndex[id],
			name = iQo.name;

		self.index[name] = self.index[name] || [];
		self.index[name].push(id);

	}

	self.postMessage({index: self.index});
}

init = function(args){

	if(!self.initted){

		self.index = self.index || {};
		self.cache = self.cache || {};
		self.query = {
			matches : function() {

			}

		};
	}

	self.initted = true;
	self.results = [];
}

