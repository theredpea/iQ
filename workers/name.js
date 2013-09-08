
stringFilter = function(query, args){

	var i = this.options.caseInsensitive ? 'i':'',
		g = this.options.globalMatch ? 'g' : '',
		m = this.options.multiLine ? 'm' : '',
		modifiers = args.modifiers || (i+g+m), //http://www.w3schools.com/jsref/jsref_obj_regexp.asp
		regEx = new RegExp(query, modifiers);


	return function(object) {
		//True if the regex matches
		//object.key;		//		The simple thing; string representing it;
		//object.aspect; // 		The complex thing; maybe DateContext object, whatever
		return regEx.test(object.aspect);		//For a string; key == aspect
	}
}

addEventListener('message', 
function(event)
{
	self.index = self.index || {};
	if(event.data.init && event.data.initValue)
	{
		for (id in event.data.initValue)
		{
			var iQo = event.data.initValue[id],
				name = iQo.name;

			self.index[name] = self.index[name] || [];
			self.index[name].push(id);

		}
		self.postMessage({index: self.index});
	}
	else if (event.data.query && event.data.queryValue)
	{

		var regValue = event.data.queryValue instanceof RegExp ?
							event.data.queryValue
							: new RegExp(event.data.queryValue),
			keyMatches = Object.keys(self.index).filter(function(name){
				return name.match(regValue);
			}),
			resultIds = keyMatches.map(function(key) { return self.index[key];});

			self.postMessage({results: resultIds});
	}

},
false)