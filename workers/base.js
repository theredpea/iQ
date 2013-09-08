Base = { 
        onMessage: function(event){
                        this.init();
                        //throw JSON.stringify(this.invertedIndex == undefined)_;
                        var method = event.data.method;


                        if (method in this || method in this.prototype)
                        {
                            (this[method] || this.prototype[method]).call(this,event.data.args);
                            //this[method](event.data.args);
                        }
                        else{
                            throw 'Inheritance not working';
                        }
                    },

    init: function(args){


        if(!this.initted){

            this.invertedIndex = this.invertedIndex || {};
            this.cache = this.cache || {};
        }


        this.initted = true;
        this.results = [];
        return !this.initted;
    },

    makeInvertedIndex : function(args){
        var originalIndex = args.originalIndex  || args[0] || [],	//It's the first arg;
            reset =         args.reset          || args[1] || false;

        if (this.invertedIndex && reset)
            this.postMessage({index: this.invertedIndex})

        for (id in originalIndex)
        {

            var iQo = originalIndex[id],
                invertedKey = this.getInvertedKey(iQo); //Get the key from the iQ object; 
                //extend getInvertedKey to get invertedIndex to hold keys (must be strings;)

            this.invertedIndex[invertedKey] = this.invertedIndex[invertedKey] || [];
            this.invertedIndex[invertedKey].push(id);

        }

        this.postMessage({index: this.invertedIndex});

        //Odd, these don't return the same results?
        //throw reGet('a.b.c.', {a:{b:{c:2}}});
        //throw this.prototype.reGet.call(this, 'a.b.c', {a:{b:{c:2}}});
    },

    ///Default getInvertedKey behavior
    getInvertedKey : function(obj) {
        return obj.name;
    },

    ///Syntax:
    	/*
    	{

    		//query is a special syntax
    		query : [
    			{
    				and : [
					 { functionName0: [arg0, arg1...] },
					 { functionName1: [arg0, arg1...] }
    			]
					or: {
						functionName2: [arg0, arg1...]
					}
    		],

    		//They provide a function
    		query : 'function() { ... }'

    		//Or each worker can type-check for special behavior
    		query : 'cashAndCash' //Can pass to the regEx
			
			//
    		query : ''
    	}
*/

//Takes k's, which are the keys representing the main aspect of this worker
//Produces objects that may be filtered and subsequently re-mapped;
	aspectMapper : function(k){ 
				//Only define aspectIndex if you need to map something like
						//string object, ISO date
						//into complex DateContext
				aspect = (this.aspectIndex 
						&& this.aspectIndex.indexOf(k)>-1) ?
							this.aspectIndex[k]
							: k;
				//Need to hold onto the key because we'll put it through invertedIndexMapper
				//To map from keys back to  the results; IDs of value locations
				return { key: k, aspect: aspect };
	},
//Takes the object and intelligently maps back into the originalIndex objects
	invertedIndexMapper : function(object){
		if (object.key) return this.invertedIndex[object.key] || object;
		else return this.invertedIndex[object] || object;
	},
//This is an identity function; 
	vocabMapper : function(object){
		return object.key ? object.key : object;

	},

	retrieveVocab : function(args){
			args.vocab = this.vocabMapper;
			return this.retrievePostings(args)
	},

	retrievePostings : function(args){
			var query = args.query || args[0],
				filterFunc = function(object){ return true; },
				identityFunc = this.aspectMapper || function(object){ return object; },
				resultsFunc = args.vocab || this.invertedIndexMapper || function(object) { return object},
				that = this;

				if (typeof(query) == 'string'){
					
					try{
						var evalArg = eval(query);
						if (typeof(evalArg) == 'function');
						filterFunc = evalArg;

					}
					catch(e){
						console.log('not a function, just a string?' + query);

						filterFunc = this.stringFilter(query, args);
					}
				}

					var keyMatches = Object.keys(self.invertedIndex)
									.map(identityFunc)				//aspectMapper by default; inflates the object
									.filter(filterFunc),
					//results could be IDs, which are set-operated into a resultset in main.js
					//Or results could be something else; vocabulary for a type-ahead
					results = keyMatches
									.map(resultsFunc);

				self.postMessage({
							results: 	results, 
							stats: 		this.getStats() 
						});
	},


	getStats : function(){
			return {
				/*count: ,
				time:,
				operations:,
				depth:, 
				*/
			};
	}



};


reGet = function(arg, obj) { 
        if (typeof(arg)==typeof('string')) 
            return reGet(arg.split('.'), obj) 
        else if (typeof(arg)==typeof([])) { 
                if (arg.length==1)
                    return obj[arg[0]] 
                else
                    return reGet(arg.splice(1), obj[arg[0]])

            }
    }


Base.reGet = reGet;