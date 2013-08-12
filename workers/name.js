
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