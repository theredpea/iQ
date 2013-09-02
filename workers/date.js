
importScripts('base.js');

self.prototype = self.Base;

addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);


//cascadeWorkers

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



getInvertedKey = function(obj) {
    return obj.contextRef;
}

init = function(args){
	self.prototype.init.call(self, args);

    //throw JSON.stringify(this.invertedIndex==undefined);

}

