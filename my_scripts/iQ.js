//define('iQ',['Q'], 
//function(){

iQ = function(options){
    //From Original iQ.js
    if (!(this instanceof iQ))   //http://ejohn.org/blog/simple-class-instantiation/
        return new iQ(options);
    
    this.options = {
        and_or: 'and',
        cache: true    
    };

    for (option in options) this.options[option] = options[option]; //Extend

    //Push onto this list when running a query like name('cash')
    //Then get its results later
    this.queryDeferreds = [];

    };

iQ._shunting = function(inputs){

    var outputs=[],
        operatorStack=[];

    inputs.forEach(function(input,index,a){
        outputs.push(input);
        if (index==0){
            //To push the second input onto outputs directly
            return;
        } else{
            //Empty list; i.e. first time returns undefined
            //Undefined 
            var topOperator = operatorStack.pop();
            if (topOperator){
                //If existing operator beats new operator
                if (iQ._precedes(topOperator, input.and_or)){

                    outputs(outputs.push(setWorker(outputs.pop(), input, topOperator)))

                } else{
                    //Push it back on, followed by the next 
                    operatorStack.push(topOperator);
                }
            }
            operatorStack.push(input.and_or);
        }
    });

iQ._opPrecedenceIndex = [
//boolean
'and',
'or',
//arithmetic

];

iQ._opAssociativityMap = {
    and: 'left',
    or: 'left'
};

iQ._precedes = function(a,b){
    var aindex=iQ._opPrecedenceIndex.indexOf(a),
        bindex = iQ._opPrecedenceIndex.indexOf(b);

    return  aindex==bindex ? iQ._isLeftAssociative(a) :  aindex > bindex;
};
iQ._isLeftAssociative = function(a){
    return iQ._opAssociativityMap[a] && iQ._opAssociativityMap[a]=='left';
}
// Read a token.
// If the token is a number, then add it to the output queue.
// If the token is a function token, then push it onto the stack.
// If the token is a function argument separator (e.g., a comma):
// Until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue. If no left parentheses are encountered, either the separator was misplaced or parentheses were mismatched.
// If the token is an operator, o1, then:
// while there is an operator token, o2, at the top of the stack, and
// either o1 is left-associative and its precedence is equal to that of o2,
// or o1 has precedence less than that of o2,
// pop o2 off the stack, onto the output queue;
// push o1 onto the stack.
// If the token is a left parenthesis, then push it onto the stack.
// If the token is a right parenthesis:
// Until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue.
// Pop the left parenthesis from the stack, but not onto the output queue.
// If the token at the top of the stack is a function token, pop it onto the output queue.
// If the stack runs out without finding a left parenthesis, then there are mismatched parentheses.
// When there are no more tokens to read:
// While there are still operator tokens in the stack:
// If the operator token on the top of the stack is a parenthesis, then there are mismatched parentheses.
// Pop the operator onto the output queue.
};

iQ.prototype.results = function(o){
    var _results = null,
        _min,
        _waitTimeInMs = (o && o.waitTimeMs || 1) * 1000,
        _now=(new Date()),
        _finish = new Date(_now.setTime(_now.getTime() + _waitTimeInMs));

        this.get(function(_){
            _results = _.results;
            o._results = _.results;
        });

        //Doesn't work, freezes the thread.
        //while (new Date().getTime() < _finish.getTime());

        return _results;
};

iQ.prototype.log = function(){
    this.get(function(_){
        console 
        && console.log 
        && console.log(_);
    });
};

iQ.prototype.forEach = function(forEachFunc){
    this.get(function(_){
        //TODO: Use a compatible foreach
        if (_ && _ .forEach){
            _.forEach(forEachFunc);
        }
    })
};
iQ.prototype.get = function(onFulfilled,onRejected, onProgress){
    this.promise().done(onFulfilled,onRejected, onProgress);
}

iQ.prototype.promise = function(){
    var results =[];
    if (this.queryDeferreds && this.queryDeferreds.reduce){

        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
        results = this.queryDeferreds
                //.sort(function(a,b){ iQ._shunting}) http://www.w3schools.com/jsref/jsref_sort.asp
                .map(function(el, index){ return el.promise; })
                .reduce(function(previousPromise, currentPromise, index, queryPromises){

            //Once both are finished
            //TODO: Could use a progress method on this consolidated promise;
            return Q.all([previousPromise, currentPromise])
                    .spread(function(prev, curr){

                        return iQ.setWorker.deferredWork(curr.and_or,
                            {0:prev.results, 1:curr.results, flatten:true},
                            (prev.results.toString() + curr.results.toString())
                            ).promise;


                        
                    });
                })  //No need for [initialValue]
	}
    if (this.queryDeferreds.length==1){
        //If length 1, no reduce;
        //It isn't and/or'd against anything;
        //Still must be flattened
        results = results.then(function(_){ 
            return iQ
                .setWorker
                .deferredWork(
                    'flatten', 
                    {list:_.results},
                    _.workHash + '.flat')
                .promise;
        });
    }

    return results;
};



///non-value Elements
 iQ.nvElements = [
     'header',
     'exclude',
     'references',
     'resources',
     'hidden',
     'footnote'];


 iQ.elements = [
     'nonFraction',
     'nonNumeric',
     'denominator',
     'exclude',
     'footnote',
     'fraction',
     'header',
     'hidden',
     'numerator',
     'references',
     'resources', 
     'tuple'];




iQ._workerFileName = function(type){
	return '/workers/' + type + '.js';
};

iQ._workerName = function(type){
    type = type.split('/').slice(-1);
	return type + 'Worker';
};

iQ._workerCallbackName = function(type){
    return '_on' + type + 'Callback'; //WorkerCallback';
};

//Workers
//Currently there are workers for individual aspects
//See #workerHierarchy for a different ideas
iQ._workers = [
    'name',
    'unit',
    'date',

    'utility/set'
    ];

//Each is made into an iQ function which directly maps to a worker
iQ._queryableWorkers = 
[
    'name',
    'unit',
    'date'
];
//Just like setWorker.js
iQ.flatten= function(twoDimArray){
    //http://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
    var flattened = [];
    return flattened.concat.apply(flattened, twoDimArray);
};
/*
iQ._f = function(f){
    return function(){
        return f.apply(f, arguments);
    }
};
*/

iQ._dom = function(e)
{
    if (e.results)
    {
        iQ.forEachNode(//iQ.flatten(event.results)
                        e.results
                        .map(function(i){ return document.getElementById(i) }),//Illegal InvocationiQ._f(documents.getElementById)),
                        function(n){
                            n.style.backgroundColor = 'green';
                        }
                    );
    }

};

iQ._workResponseCallback = function(e){
    if (e.data && e.data.method){
        var method = iQ[e.data.method] || iQ.prototype[e.data.method];
        if (method && method.call(this, e.data.args)){

        }
    } else{
        //Should bind in context of this
        iQ._deferredWorkResponseCallback.bind(this)(e);
    }
};

iQ.progress = function(args){
    //Worker response
    console.log(args && args.pct*100 + '%');
};

iQ._deferredWorkResponseCallback = function(e){
    //this refers to the Worker; since we used .bind();
    //The worker is attached to iQ global object, so it can be used by any instantiated iQ objects
    //e.data.queryIndex could be 0!
    if (e.data.workHash!==undefined){

        var deferred = this.workToDeferred[e.data.workHash];

        if (e.data.error && deferred.reject){
            deferred.reject(e.data);
        }
        else if (deferred.resolve) {
            deferred.resolve(e.data);
        }


    }

};

Worker.prototype.deferredWork = function(method, args, hashable){
    /* method: <string> name of method attached to the Worker; 
            'getPostings' for a queryableWorker; or 'and' / 'or' for setWorker
        args: <object> a "keyword" map of arguments used by the method;
        hashable: <string> a unique identifier; 
            i.e. so the Worker can connect the request with its response 
            example: a stringnified query ('cash')*/

    var hash = iQ._stringHash(hashable),
        index,
        hashIndex = (index = this.workHistory.indexOf(hash))>-1 ? index : this.workHistory.push(hash)-1, //push returns the length, not the index 
        hash = hashIndex; //JSON.stringify(query), //To hash it. NOTE:  http://stackoverflow.com/q/194846
                        

    if (this.workToDeferred===undefined) this.workToDeferred = {};

    var deferred = this.workToDeferred[hash];

    if (!deferred){
        deferred = Q.defer();

        this.workToDeferred[hash] = deferred;
        //But args may not be an object; it may be a string or an array
        //And remember, these are stringified...
        args.workHash = hash;
        this.postMessage({  

            method: method, 
            args:   args,
            //So send workHash separately
            workHash : hash

        });

    }
    return deferred;
  
};

iQ._workerReset = function(){
    iQ.deferredWorkers.forEach(function(w,i){
        w.workToDeferred =         {};
         w.workHistory =           [];
    });
};

iQ._workerSetup = function(){

        iQ.queryPromises = [];
        iQ.and_or = 'and';
        iQ.deferredWorkers=[];

        //All Workers
        //========================
        iQ._workers.forEach(function(type){
            //Strings
            var workerName          = iQ._workerName(type),
                workerFile          = iQ._workerFileName(type),
                workerCallbackName  = iQ._workerCallbackName(workerName), //iQ._workerCallbackName(type),

            //TODO: Consider nesting these inside a worker object; and a callback object respectively so we don't pollute iQ namespace
            //Worker

                worker              = iQ[workerName] = iQ[workerName] || new Worker(workerFile),
            //Function (Callback) //Only one of them at a time

            //TODO: Add this to prototype;
            //Requires attaching the messageHandler somewhere inside the constructor of this Worker constructor
                workerCallback      = iQ[workerCallbackName] = iQ._workResponseCallback.bind(worker);

            iQ.deferredWorkers.push(worker);

            //Only used by _queryableWorkers... ? Actually would be used by any worker that returns results; flesh out difference
            worker.workToDeferred =         {};
            worker.workHistory =           [];


            worker.addEventListener('message', workerCallback,false);


           

        });

        //Queryable Workers
        //========================
        iQ._queryableWorkers.forEach(function(type){

                type = type.split('/').slice(-1)[0];

                var workerName = iQ._workerName(type),
                    worker = iQ[workerName];
                if (worker){

                    var args = { originalIndex: iQ.index },
                        aspectIndex;
                    //If aspectIndices are delegated to workers...
                    if (iQ.aspectIndices && (aspectIndex = iQ.aspectIndices[type])){
                        args.aspectIndex = aspectIndex; 
                    }

                    worker.postMessage({
                        method: 'makeInvertedIndex', 
                        args: args });

                    //Create the function
                    iQ.prototype[type] = function(query){    
                        //TODO: if index changes, clear the cache
                        if (!query) throw 'Requires a truthy argument, string or function(){...}'
                        //string to string returns itself, function to string returns the evallable function, regex to string returns arg that can be passed to RegEx()
                        //An associative object to string returns [object Object]
                        var args = { 
                                    query:      query,
                                    and_or:     this.and_or || iQ.and_or || 'and', //a string; even though there are only two possible values, don't want to express with a boolean
                                    not:        this.not         //true or false
                                }
                        var method = 'getPostings';

                        var deferred = worker.deferredWork(method, args, query);

                        //Each iQ object has a separate list
                        this.queryDeferreds.push(deferred);
                        //For chainability; will intellisense work?
                        return this;
                    }
            }
        });

};

iQ._stringHash= function(obj){
if(typeof obj === 'string') return obj;
else if (obj.toString()==='[object Object]') return JSON.stringify(obj);    
return obj.toString();
};
//TODO: Join this and next... Somehow use the Promise.all method above.
iQ.prototype.and = function(next){
    this.and_or = 'and';
    return this;
}

//TODO: Join this and next... Somehow use the Promise.all method above.
iQ.prototype.or = function(next){
    this.and_or = 'or';
    return this;
}

iQ.and = function(a,b){
    return a.and(b);
}

iQ.or = function(a,b){
    return a.or(b);
}

iQ.prefixIt = function(it, prefix, escOrJoiner) {
    var joiner = ':';
    if (typeof(escOrJoiner)==='string') joiner= escOrJoiner;
    else if (escOrJoiner || escOrJoiner===undefined) joiner = '\\:'; //Escape joiner for use in iQ.allNodes

    return prefix+joiner+it;
};

iQ.prefixPlusIt = function(it, prefix, escOrJoiner){
    return [it, iQ.prefixIt(it, prefix, escOrJoiner)];
};



///Functions that create and return inner-functions; inner-functions can be used in .map
///Given first-level attributes prefix and escape
///Returns function that appends element
iQ.prefixThem = function(prefix, escapedOrJoiner){
    return function(element, index, array) {
        return iQ.prefixIt(element, prefix, escapedOrJoiner)
    };
};

iQ.prefixPlusThem = function(prefix, escapedOrJoiner){
    return function(element, index, array) {
        return iQ.prefixPlusIt(element, prefix, escapedOrJoiner)
    };
};



iQ._index = function () {
    iQ.index = iQ.options
    && iQ.options._indexProvider
    && iQ.options._indexProvider()
    || iQ._defaultIndexProvider();

};

iQ._defaultIndexProvider = function(){

        /*Returns
        @Example index:
        /*
        iQ_0: {
                contextRef: "fy10d"
                index: 0
                ixType: "IX:NONNUMERIC"
                name: "dei:DocumentType"
                value: "10-K"
            },
        iQ_1: {
                contextRef: "fy10d"
                format: "ixt:datelongus"
                index: 1
                ixType: "IX:NONNUMERIC"
                name: "dei:DocumentPeriodEndDate"
                value: "December 31, 2010 "
        }
        */
        //1) It is valid JSON
        //2) It can be stringified without loss of fidelity (i.e. no DOM nodes)
        //3) The keys can be used to quickly lookup values
        //4) The keys can be used with an ID selector to find location in DOM

        iQ.allNodesElements = iQ.flatten(    //Necessary because we use prefixPlus
                            iQ.elements.map(                //TODO: Shim for native array map method
                                iQ.prefixPlusThem('ix')
                            )
                        );
                                    
        var allElements     = iQ.allNodes(iQ.allNodesElements),
            index           = {},
            indexF          =   function(ixNode, i){
                                    var iQid        = iQ.prefixIt(i, 'iQ', '_'),
                                        ixType      = ixNode.nodeName,
                                        //TODO: Accommodate all attributes, not just nonFraction's? 
                                            //http://www.xbrl.org/Specification/inlineXBRL-part1/PWD-2013-02-13/inlineXBRL-part1-PWD-2013-02-13.html#sec-nonFractions
                                        //TODO: Accommodate more complex content; cast them as their Javascript equivalent
                                            //HTML text
                                            //Numbers
                                            //Booleans

                                        valueResult = {
                                            ixType          :ixType,            
                                            value           :iQ._text(ixNode),
                                            index           :i
                                        };

                                    iQ.attrs.forEach(function(attr){
                                        var v;
                                        if(v=iQ._attr(ixNode, attr)) valueResult[attr]=v;
                                    });
                                    //TODO: Special processing depending on ixType?


                                    //Displace their ID
                                    if(ixNode.id) ixNode.setAttribute('data-original-id', ixNode.id);
                                    ixNode.id = iQid;
                                    index[iQid] = valueResult;
                                };
            iQ.forEachNode(allElements, indexF);
        
            return index;
 };

/*
Why:
	To find relevant attributes from elements.
Link:
	http://www.xbrl.org/Specification/inlineXBRL-part1/REC-2010-04-20/inlineXBRL-part1-REC-2010-04-20.html#table-inlinexbrlattributes
Note:
	These are "Inline XBRL Attributes". They are not namespaced in the spec.
*/
iQ.attrs =[
	'arcrole',
	'contextRef',
	'decimals',
	'escape',
	'footnoteID',
	'footnoteLinkRole',
	'footnoteRefs',
	'footnoteRole',
	'format',
	'id',
	'name',
	'precision',
	'order',
	'scale',
	'sign',
	'target',
	'title',
	'tupleID',
	'tupleRef',
	'unitRef'];


iQ._header = function(){
    iQ.aspectIndices = iQ.options
    && iQ.options._aspectProvider
    && iQ.options._aspectProvider()
    || iQ._defaultAspectProvider();

    //iQ.unitRef = iQ.aspectIndices.unit;
};

iQ._defaultAspectProvider = function(){
  	/*Returns:
    Example aspect index
        /*
        date : {
            fy07e: 
            {
                entity: {
                    identifier: "9876543210"
                    scheme: undefined
                }
                id: "fy07e"
                index: 10
                period: {
                    endDate: undefined
                    endDateDate: Invalid Date
                    instant: "2007-12-31"
                    instantDate: Sun Dec 30 2007 17:00:00 GMT-0700 (Mountain Standard Time)
                    startDate: undefined
                    startDateDate: Invalid Date
                }
                segment: {}
            }
        }
        */
        //1)Lookup for XBRL refs; a single ref represents many domains/many aspects
        //2)Create common shortcut queries; fy07e is equivalent to "every value as of 2007-12-31"
            //.id('9876543210').asOf('2007-12-31');
            //No need to set.intersection the results of two separate workers (idWorker and dateWorker)
            //If we can build logic that can infer 'fy07e' from the query .id('9876543210').asOf('2007-12-31');
        //3)Valid JSON (even the Date objects); can (must) be passed to workers to create individual
        
    var header      = iQ.firstNode(iQ.prefixPlusIt('header', 'ix')),
        contexts    = iQ.allNodes(header, iQ.prefixPlusIt('context', 'xbrli')),
        units       = iQ.allNodes(header, iQ.prefixPlusIt('unit', 'xbrli'));

        iQ.unitRef ={};
        iQ.contextRef = {};
        //unit is used by unitWorker
            //unitWorker might delegate to numeratorWorker, denominatorWorker...
        //context is used by contextWorker
            //delegate to startWorker, endWorker, timeSpanWorker, memberWorker, axisWorker
  		iQ.forEachNode(contexts, iQ._processContextNode);

    	iQ.forEachNode(units, iQ._processUnitNode);   

        //#workerHierarchy
    	//Currently making a worker for the smallest queryable property; i.e. date, name, member; each of which has a worker. 
            //This means a single broad aspectIndex; contextRef is sent to multiple workers
        //Consider creating workers for the broader iQ concept; context; which delegates to date, or member: a tree of concepts forms a hierarchy of workers; 
            //This means a single broad aspectIndex; contextRef is sent to the parent worker who can decompose it into smaller aspectIndices for subWorkers
    	return {
            unit    : iQ.unitRef, 
            date    : iQ.contextRef, 
            member  : iQ.contextRef };
        
};

iQ._init = function(options){
    iQ.options = options;

    //if (!(iQ.options && iQ.options._skipHeaders))
    iQ._header();
    iQ._index();
    iQ._workerSetup();
}

//TODO: More of these, and they can use the prefix the iXBRL doc defines
//Also provide prefixItPlus alternatives
iQ._xbrli = function(it){
    return iQ.prefixIt(it, 'xbrli');
};

iQ._processContextNode = function (contextNode, index, nodeList)
{

        //1) date texts are ISO 8601 
        //2) they are unions of date and dateTime
        //3) there are rules for inferring time if only a date is provided


        //In original iQ.js, I converted date texts to Date objects
        //TODO: Should I do it? Use the right rules. See iQ.dateFromIso; see aspects/DateExp
        //Need to accommodate not just dates, but times; and time zones!

         
        var identifierNode  = iQ.firstNode(contextNode, iQ.prefixIt('identifier', 'xbrli')),
            periodNode      = iQ.firstNode(contextNode, iQ.prefixIt('period', 'xbrli')),
            segmentNodes    = iQ.allNodes(contextNode, iQ.prefixIt('segment', 'xbrli')),
            periodTextF     = function(text) { return iQ._text(iQ.firstNode(periodNode, iQ.prefixIt(text, 'xbrli'))) },
            segmentMaker    = function(s) { return function(memberNode) { s[iQ._attr(memberNode, 'dimension')] = iQ._text(memberNode) }},
            startDate       = periodTextF('startDate'),
            endDate         = periodTextF('endDate'),
            instant         = periodTextF('instant'),
            forever         = new Boolean(iQ.firstNode(periodNode, iQ.prefixIt('forever', 'xbrli'))),
            entityObject    = {
                identifier  :iQ._text(identifierNode),
                scheme      :iQ._attr(identifierNode)
            },
            segmentObject   = {},
            throwAway       = iQ.forEachNode(segmentNodes, segmentMaker(segmentObject)),
            periodObject    = {
                startDate       :startDate,
                startDateDate   :new Date(startDate),   //See above re: dateFromIso; I don't think IE Date constructors recognize ISO strings
                endDate         :endDate,
                endDateDate     :new Date(endDate),
                instant         :instant,
                instantDate     :new Date(instant),
            },

            contextResult   = {
                id              :contextNode.id,
                entity          :entityObject,
            //Keyed on ['startDate', 'endDate', 'instant']
                //transferrence; should I un-nest this?
                period          :periodObject,
                segment         :segmentObject,
                index           :index 
            };
        //assert periodObject.instantDate == new Date(periodObject.instant)
        //Observed in other aspectProviders
        iQ.contextRef[contextResult.id]= contextResult;

};


iQ._processUnitNode = function(unitNode, index, nodeList)
{

    //TODO: Support multiplication? Two measures?
    var measureQ        = iQ.prefixIt('measure', 'xbrli'),
        measureNodes    = iQ.allNodes(unitNode, measureQ),
        measureNode     = measureNodes[0], //iQ.firstNode(unitNode, measureQ),
        numeratorNode   = iQ.firstNode(unitNode, iQ.prefixIt('numerator', 'xbrli')),
        denominatorNode = iQ.firstNode(unitNode, iQ.prefixIt('denominator', 'xbrli')),
        unitResult = {
            id              :unitNode.id,   //.getAttribute('id'), //attributes['id'],
            measure         :iQ._text(measureNode),
            numerator       :iQ._text(iQ.firstNode(numeratorNode, measureQ)),
            denominator     :iQ._text(iQ.firstNode(denominatorNode, measureQ)),
            multiplicands   :iQ.mapNode(measureNodes, iQ._text),  
            index           :index,        
            //http://math.stackexchange.com/a/229564
            // http://www.xbrl.org/Specification/XBRL-RECOMMENDATION-2003-12-31+Corrected-Errata-2008-07-02.htm#_example_21
            //results         :[],           
            //count           :0
        }
        //assert unitNode.id == unitResult.id == iQ.unitRef[unitNode.id].id
        //Holds true for other injected _aspectProviders
        iQ.unitRef[unitNode.id] = unitResult;
};



//DOM utilities
//===============================
iQ._qsa = function(queryStringOrNode, queryString)
{
    return iQ._q(queryStringOrNode, queryString, 'querySelectorAll');
};
iQ.allNodes = iQ._qsa;

iQ._ce = function(elementName){
    return document.createElement(elementName);
}
iQ.el = iQ._ce;

iQ._qs = function(queryStringOrNode, queryString)
{
    return iQ._q(queryStringOrNode, queryString, 'querySelector');
};

iQ.firstNode = iQ._qs;

//Would prefer to use this for 
iQ.nodesNamed = function(tagNameOrNode, tagName)
{
    return iQ._q(tagNameOrNode, tagName, 'getElementsByTagName');
};

iQ._q = function(queryStringOrNode, queryString, queryMethod)
{

    if (queryStringOrNode){

        //query whole document; 
        //Odd: String('this') instanceof String == false
        if (typeof(queryStringOrNode)==='string' || queryStringOrNode instanceof Array){
            return document[queryMethod](queryStringOrNode);
        }
        //first arg is a node; query its children
        else{
            return queryStringOrNode[queryMethod](queryString);
        }
    }

};

iQ._text = function(node)
{
    if (node) return node.textContent;
}

iQ._attr = function(node, attr)
{
    if (node && attr) return attr instanceof Array ?
                        attr.map(function(att){node.getAttribute(att); })
                        : node.getAttribute(attr);
}

///NodeList utilities
///=========================================
iQ.forEachNode = function(nodeList, eachFunction)
{
    if (nodeList) return [].forEach.call(nodeList, eachFunction);

}

iQ.mapNode = function(nodeList, eachFunction)
{
    if (nodeList) return [].map.call(nodeList, eachFunction);
}



//Math utilities
//===================
iQ._average = function()
{
    var sum=0;
    var count =0;
    this.values().forEach(function(v,i,a){
        sum+=v;
        count++;
    })
    return sum/count;
}

// return iQ;

// });