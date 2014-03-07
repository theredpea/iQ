'use strict';

importScripts('../scripts/require.js');


define({
    onMessage: function(event){
                    this.init(event.data.args);
                    //throw JSON.stringify(this.invertedIndex == undefined)_;
                    var method = event.data.method;


                    if (method in this || method in this.prototype)
                    {
                        //apply will unpack an array
                        //Call will send them directly
                        //Using call because args will be used as a kwarg
                        (this[method] || this.prototype[method]).call(this,event.data.args);
                        //this[method](event.data.args);
                    }
                },

    init: function(args){

        //Like Underscore's _once
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

        //TODO: Only because set.js doesn't have this method.
        if (!this.getInvertedKey) return; //

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
			var query = args.query,// || args[0],
                not = args.not,//|| args[1], //not defaults to false
                and_or = args.and_or;

                filterFunc = function(object){ return true; },  //Default
                //TODO: Document
				identityFunc = this.aspectMapper || aspectMapper, //function(object){ return object; },
                //TODO: Document
				resultsFunc = args.vocab || invertedIndexMapper, // || //function(object) { return object},
				that = this;

				if (typeof(query) == 'string'){
					
					try{
						var evalArg = eval(query);
						if (typeof(evalArg) == 'function');
						filterFunc = evalArg;

					}
					catch(e){
						//console.log('not a function, just a string?' + query);

						filterFunc = this.stringFilter(query, args);
					}
				}
				//throw(new String(filterFunc));
				//throw (new String(identityFunc));

				var keyMatches = Object.keys(self.invertedIndex)
								.map(identityFunc)				//aspectMapper by default; inflates the object
								.filter(filterFunc),
    				//results could be IDs, which are set-operated into a resultset in main.js
    				//Or results could be something else; vocabulary for a type-ahead
    				results = keyMatches
    								.map(resultsFunc);
				//throw(new String(self.and));
                //TODO: How does or work? Shouldn't main script handle "and/or"ing
                args.results = results;//self.or.apply(this,results);

				self.postMessage(args);
	},


	getStats : function(){
			return {
				/*count: ,
				time:,
				operations:,
				depth:, 
				*/
			};
	},

reGet : function(arg, obj) { 
        if (typeof(arg)==typeof('string')) 
            return reGet(arg.split('.'), obj) 
        else if (typeof(arg)==typeof([])) { 
                if (arg.length==1)
                    return obj[arg[0]] 
                else
                    return reGet(arg.splice(1), obj[arg[0]])

            }
    },


//Input: Keys/refs representing the main aspect of this worker
//Output: Objects that that may be filtered and subsequently re-mapped into even smaller indexes
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

invertedIndexMapper : function(object){
		if (object.key) return this.invertedIndex[object.key] || object;
		else return this.invertedIndex[object] || object;
	},
//This is an identity function; 
vocabMapper : function(object){
		return object.key ? object.key : object;

	}
}
);