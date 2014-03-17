
importScripts('base.js','aspects/DateExp.js');

self.prototype = Base;

//If this setup becomes long; move to Base init()
addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);

getInvertedKey = function(obj) {
    return obj.decimals;
}


//Takes a string, produces a function which acts on the object;
stringFilter = function(query){
	
	var dExp = new DateExp(query);

	return function(object){
		return dExp.test(object.aspect);
	}
}

init = function(args){
	self.prototype.init.call(self, args);

    //throw JSON.stringify(this.invertedIndex==undefined);

};

//Huh?
matches = function(args){

		var regValue = event.data.queryValue instanceof RegExp ?
							event.data.queryValue
							: new RegExp(event.data.queryValue)
}

