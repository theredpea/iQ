
addEventListener('message', onMessage, false);


function onMessage(event)
{
	self.init();

	var method = event.data.method;
	if (method in self)
	{
		self['method'](event.data.args)
	}


	

}

function retrievePostings(args){
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



function makeInvertedIndex(args){
	var originalIndex = args.originalIndex || args[0];
	for (id in event.data.originalIndex)
	{
		var iQo = event.data.originalIndex[id],
			name = iQo.name;

		self.index[name] = self.index[name] || [];
		self.index[name].push(id);

	}
	self.postMessage({index: self.index});
}


function init(event){

	if(!self.initted){

		self.index = self.index || {};
		self.cache = self.cache || {};
		self.query = {
			matches : function() {

			},
			contains = 


		};
	}

	//Using a generalized
	//self.query = event.data.query;
	self.initted = true;
	self.results = [];
}

///
function invertedIndex(){

}

function filter
function query