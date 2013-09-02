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
            this.query = {
                matches : function() {

                }

            };
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

        throw this.prototype.reGet.call(this, 'a.b.c', {a:{b:{c:2}}});
    },

    getInvertedKey : function(obj) {
        return obj.name;
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