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
    },

    makeInvertedIndex : function(args){
        var originalIndex = args.originalIndex  || args[0] || [],
            reset =         args.reset          || args[1] || false;

        if (this.invertedIndex && reset)
            this.postMessage({index: this.invertedIndex})

        for (id in originalIndex)
        {

            var iQo = originalIndex[id],
                invertedKey = this.getInvertedKey(iQo); //Get the key from the iQ object

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
	
	retrievePostings = function(args){
			var query = args.query || args[0],
				filter = function(){ return true; } //Everything

				if (typeof(query) == 'string'){
					
					try{
						var evalArg = eval(args);
						if (typeof(evalArg) == 'function');
						filter = evalArg;

					}
					catch(e){
						console.log('not a function');

						filter = this.stringFilter(query);
					}
				}

					keyMatches = Object.keys(self.invertedindex).filter(function(name){
					return name.match(regValue);
				}),
				resultIds = keyMatches.map(function(key) { return self.invertedindex[key];});

				self.postMessage({results: resultIds});
	},



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