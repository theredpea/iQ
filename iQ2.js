

iQ = {};

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


iQ._workerResponse = function(event, workerName)
{
    //event.data contains an array of values
    //alert('Got results from worker: ' + workerName);
    //iQ.results = iQ.results || {};
    //iQ.results[workerName] = event.data;
    console.log(event.data);
    if (event.data.results instanceof Array)
    {
        iQ.forEachNode(iQ
                        .flatten(event.data.results)
                        .map(function(id){
                                    return document.getElementById(id);
                                }),
                        function(n){
                            n.style.backgroundColor = 'green';
                        }
                    );
    }

};

iQ.name = function(name){

	//Need to give it some GUID; maybe just increment it?
	//Accommodate and's, or's...
    if(iQ['nameWorker']){
        iQ['nameWorker'].postMessage({query: true, queryValue: name});
    };

};

iQ._workerFileName = function(type){
	return 'workers/' + type + '.js';
};

iQ._workerName = function(type){
	return type + 'Worker';
};

iQ._workerCallbackName = function(type){
    return '_on' + type + 'WorkerCallback';
};

iQ._workerTypes = [
    'name', 
    'unit', 
    'date'];

iQ._workerSetup = function(){

        iQ._workerTypes.forEach(function(type){
            //Strings
            var workerName          = iQ._workerName(type),
                workerFile          = iQ._workerFileName(type),
                workerCallbackName  = iQ._workerCallbackName(type),
            //Worker
                worker              = iQ[workerName] = iQ[workerName] || new Worker(workerFile),
            //Function (Callback)
                workerCallback      = iQ[workerResponseName] = function(e){ iQ._workerResponse(e, workerName); };

            worker.addEventListener('message', workerCallback,false);

            var args = {},
                aspectIndex;
            //If aspectIndices are delegated to workers...
            if (iQ.aspectIndices && (aspectIndex = iQ.aspectIndices[type])){
            	args.aspectIndex = aspectIndex; 
            }
            console.log(args);

            iQ[workerName].postMessage({
            	method: 'makeInvertedIndex', 
            	args: args,
            	});

        });




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

iQ.flatten = function(twoDimArray){
    //http://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
    var flattened = [];
    return flattened.concat.apply(flattened, twoDimArray);
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

    	//Currently making a worker for the smallest queryable property; i.e. date, name, member; each of which has a worker. 
            //This means a single broad aspectIndex; contextRef is sent to multiple workers
        //Consider creating workers for the broader iQ concept; context; which delegates to date, or member: a tree of concepts forms a hierarchy of workers; 
            //This means a single broad aspectIndex; contextRef is sent to the parent worker who can decompose it into smaller aspectIndices for subWorkers
    	iQ.aspectIndices = {
            unit    : iQ.unitRef, 
            date    : iQ.contextRef, 
            member  : iQ.contextRef };

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
                id              :contextNode.id,        //This ID becomes another kind of index for the worker; the ivnertedIndex only need have these as values
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
//iQ._workerSetup();