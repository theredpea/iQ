
define('iQ', ['Q'], function(Q){


iQ = function(options){
    //From Original iQ.js
   /*this.o = $.extend(
                    {
                        url: 'http://www.xbrl.org/inlinexbrlextractortutorial/MassiveDynamic.html',
                        inflate: true,
                        loadDts: false,
                        types: [], //Means to use iQ.el
                        sortBy: 'dom',
                        strict: false,
                        target: 'body'
                    },
                    oOptions)
        */
    if (!(this instanceof iQ))   //http://ejohn.org/blog/simple-class-instantiation/
        return new iQ(options);
    
    this.options = {
        and_or: 'and'        
    };

    for (option in options) this.options[option] = options[option]; //Extend

    //Push onto this list when running a query like name('cash')
    //Then get its results later
    this.queryDeferreds = [];

    };

iQ.prototype.get = function(onFulfilled,onRejected, onProgress){
    var results =[];
    if (this.queryDeferreds && this.queryDeferreds.reduce){

        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
        results = this.queryDeferreds
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

    return results.done(onFulfilled,onRejected, onProgress);
};

iQ.andOrPostings


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
iQ._workers;

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

/*
PromiseWorker = function(){
    Worker.apply(this, arguments);
};
PromiseWorker.prototype = Worker.prototype;
*/

//Should the args by an object?
Worker.prototype.deferredWork = function(method, args, hashable){
                        //Each worker has a list;

    var hash = iQ._stringHash(hashable),
        index,
        hashIndex = (index = this.workHistory.indexOf(hash))>-1 ? index : this.workHistory.push(hash)-1, //push returns the length, not the index 
        hash = hashIndex; //JSON.stringify(query), //To hash it. NOTE:  http://stackoverflow.com/q/194846
                        

    if (this.workToDeferred===undefined) this.workToDeferred = {};

    var deferred = this.workToDeferred[hash];

    if (!deferred){
        deferred = Q.defer();

        this.workToDeferred[hash] = deferred;
        args.workHash = hash;
        this.postMessage({  

            method: method, 
            args:   args

        });

    }
    return deferred;
  
};

iQ._workerSetup = function(){

        iQ.queryPromises = [];
        iQ.and_or = 'and';

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
                workerCallback      = iQ[workerCallbackName] = iQ._deferredWorkResponseCallback.bind(worker);


            //Only used by _queryableWorkers... ? Actually would be used by any worker that returns results; flesh out difference
            worker.workToDeferred =         {};
            worker.workHistory =           [];


            worker.addEventListener('message', workerCallback,false);

            var args = {
                    originalIndex: iQ.index
                },
                aspectIndex;
            //If aspectIndices are delegated to workers...
            if (iQ.aspectIndices && (aspectIndex = iQ.aspectIndices[type])){
            	args.aspectIndex = aspectIndex; 
            }

            //TODO: Separate set which does not have this method;
            //Do this only with the queryableWorkers
            iQ[workerName].postMessage({
            	method: 'makeInvertedIndex', 
            	args: args,
            	});

        });

        //Queryable Workers
        //========================
        iQ._queryableWorkers.forEach(function(type){
                type = type.split('/').slice(-1)[0]; //For utility/set...nah shouldn't be in here

                var workerName = iQ._workerName(type),
                    worker = iQ[workerName];
                if (worker){
                    //Create the function
                    iQ.prototype[type] = function(query){    
                        //TODO: if index changes, clear the cache

                        //string to string returns itself, function to string returns the evallable function, regex to string returns arg that can be passed to RegEx()
                        //An associative object to string returns [object Object]
                        var args = { 
                                    query:      query,
                                    and_or:    iQ.and_or || 'and', //a string; even though there are only two possible values, don't want to express with a boolean
                                    not:        iQ.not         //true or false
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
iQ.prototype.and = function(next){
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
        
            //Example index:
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
            //3) The keys can be used to quickly lookupv alues
            //4) The keys can be used with an ID selector to find location in DOM

            iQ.index = index;
        //this.index.elements;

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


iQ._processHeader = function()
{
  	
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
    	iQ.aspectIndices = {
            unit    : iQ.unitRef, 
            date    : iQ.contextRef, 
            member  : iQ.contextRef };
        //Example aspect index
        /*fy07e: 
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
        */
        //1)Lookup for XBRL refs; a single ref represents many domains/many aspects
        //2)Create common shortcut queries; fy07e is equivalent to "every value as of 2007-12-31"
            //.id('9876543210').asOf('2007-12-31');
            //No need to set.intersection the results of two separate workers (idWorker and dateWorker)
            //If we can build logic that can infer 'fy07e' from the query .id('9876543210').asOf('2007-12-31');
        //3)Valid JSON (even the Date objects); can (must) be passed to workers to create individual
        


};

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
        //return contextResult;
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

        iQ.unitRef[unitResult.id] = unitResult;
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


//UI utilities
//========================


iQ._processHeader();
iQ._index();
iQ._workerSetup();

return iQ;

});