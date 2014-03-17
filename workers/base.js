Base = { 
    onMessage: function(event){
                    this.init(event.data.args);
                    //throw JSON.stringify(this.invertedIndex == undefined)_;
                    var method = event.data.method;

                    this.workHash = event.data.workHash;
                    this.query = event.data.query;
                    this.args = event.data;

                    if (method in this || method in this.prototype)
                    {
                        (this[method] || this.prototype[method]).call(this,event.data.args);
                        //this[method](event.data.args);
                    }
                },

    init: function(args){


        if(!this.initted){
            //Map; 
                //keys are the value of the iXBRL object's relevant property; for a dateWorker it's a iQ's context:DateContext; for a nameWorker it's a value's name:String
                //values is an array representing the iQ ids (mapped to nodes in the DOM; and objects in the iQ instance) which have this elemental 
                    //OR it could be an array representing the aspectIndex ids
            this.invertedIndex  = {};
            //For memoizing results with queries
                //keys are queries (stringified)
                //values are the results
            this.cache          = {};
            //Reset
            this.results        = [];
            //Only specific workers i.e. date, (context), will need aspectIndex
                //keys are the iXBRL author's identifier for the resource; i.e. contextRef/context.id for a context object
                //values are the resource itself; i.e. all the details of context
            this.aspectIndex = args && args.aspectIndex;
            //To avoid double-dipping
            this.initted = true;

        }

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

//Takes the object and intelligently maps back into the originalIndex objects

	getVocab : function(args){
			args.vocab = vocabMapper;
			return this.getPostings(args)
	},

	getPostings : function(args){
			var query = args.query || args[0],
				filterFunc = function(o){ return true; },
                identityFunc = function(o) {return o; },
				mapFunc =       this.aspectMapper || aspectMapper, 
				resultsFunc =   args.vocab || invertedIndexMapper,
				that = this;
                //Defaulting
                filterFunc = identityFunc;
                //Currently we only support strings, but...
				if (typeof(query) == 'string'){
					try{
                        //They can be stringified eval-able functions...
						var evalArg = eval(query);
						if (typeof(evalArg) == 'function');
						filterFunc = evalArg;
                        self.postMessage
					}
					catch(e){
                        //Or normal strings which have their own expressional meaning (ie regExp,dateExp)
						filterFunc = this.stringFilter(query, args);
					}
				}
				var keys = Object.keys(self.invertedIndex);
                var keyLength = keys.length;
                var keyMatches = keys
                                //aspectMapper by default; inflates the object
								.map(mapFunc)				
								.filter(this
                                    .prototype
                                    .filterProgress(filterFunc, keyLength)),
				
                //results could be IDs, which are set-operated into a resultset in main.js
				//Or results could be something else; vocabulary for a type-ahead
				results = keyMatches
								.map(resultsFunc);

                args.results = results;

				self.postMessage(args);
	},
    filterProgress: function(filterFunc,total){
        //Measures and sends info about progress
        var count=0;
        var that = self;
        var accumulated = [];

        return function(object){
            if (filterFunc(object)){
                count++;
                accumulated.push(object)
                that.prototype.sendProgress(count/total, results);
                return true;
            }
        }

    },
    sendProgress : function(pct, results){
        //What percentage of overall progress 
        self.args.pct = pct;
        //Accumualted results
        self.args.results = results;

        self.postMessage({   
            method:     'progress',
            args :      self.args,
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


//Input: Keys/refs representing the main aspect of this worker
//Output: Objects that that may be filtered and subsequently re-mapped into even smaller indexes
aspectMapper = function(k){ 
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
};

invertedIndexMapper = function(object){
		if (object.key) return this.invertedIndex[object.key] || object;
		else return this.invertedIndex[object] || object;
	};
//This is an identity function; 
vocabMapper = function(object){
		return object.key ? object.key : object;

	};


Base.reGet = reGet;
Base.aspectMapper = aspectMapper;
Base.invertedIndexMapper = invertedIndexMapper;
Base.vocabMapper = vocabMapper;