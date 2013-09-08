importScripts('base.js');

self.prototype = self.Base;

addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);

getInvertedKey = function(obj) {
	//TODO: Delegate prefix, localPart to subworkers?
	return obj.name;
};

init = function(args){
	//Defaults
	if (!self.initted){

	var cont = self.prototype.init.call(self,args);
	//Continue decides whether it's been initted
	//if(cont){
		self.options = {
			caseInsensitive:true,
			globalMatch: true,
			multiLine: true
		}
		//Extend
		if (args && args.options){
			for (option in args.options){
				self.options[option] = args.options[option];
			}
		}
	}

	//}
};

stringFilter = function(query, args){

	var i = self.options.caseInsensitive ? 'i':'',
		g = self.options.globalMatch ? 'g' : '',
		m = self.options.multiLine ? 'm' : '',
		modifiers = args.modifiers || (i+g+m), //http://www.w3schools.com/jsref/jsref_obj_regexp.asp
		regEx = new RegExp(query, modifiers);


	return function(object) {
		//True if the regex matches
		//object.key;		//		The simple thing; string representing it;
		//object.aspect; // 		The complex thing; maybe DateContext object, whatever
		//throw(query);
		return regEx.test(object.aspect);		//For a string; key == aspect
	}
}