

iQ = {};

///non-value Elements
 iQ.nvElements = [
     'header',
     'exclude',
     'references',
     'resources',
     'hidden',
     'footnote'
 ];


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
    alert('Got results from worker: ' + workerName);
    iQ.results = iQ.results || {};
    iQ.results[workerName] = event.data;
    if (event.data.results instanceof Array)
    {
        iQ._eachNodes(iQ
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

    if(iQ['nameWorker']){
        iQ['nameWorker'].postMessage({query: true, queryValue: name});
    };

};

iQ._workerSetup = function()
{
    var workerList = ['name', 'date'];
        workerList.forEach(function(type){
            var workerName = type + 'Worker',
                workerFile = 'workers/' + type + '.js',
                workerResponseName = '_on' + workerName + 'WorkerResponse';
            iQ[workerName]= new Worker(workerFile);
            iQ[workerResponseName] = function(e){
                iQ._workerResponse(e, workerName);
            };
            iQ[workerName].addEventListener(
                    'message',
                    iQ[workerResponseName],
                    false
                );
            iQ[workerName].postMessage({method: 'makeInvertedIndex', args: [iQ.index]});

        });




}


iQ.prefixIt = function(it, prefix, escOrJoiner) {
    var joiner = ':';
    if (typeof(escOrJoiner)==='string') joiner= escOrJoiner;
    else if (escOrJoiner || escOrJoiner===undefined) joiner = '\\:';

    return prefix+joiner+it;
};

iQ.prefixPlusIt = function(it, prefix, escOrJoiner){
    return [it, iQ.prefixIt(it, prefix, escOrJoiner)];
};



///A map-ready function-creator
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

        iQ.allElements = iQ.flatten(
                                    iQ.elements.map(            //TODO: Shim for native array map method
                                        iQ.prefixPlusThem('ix')
                                        )
                                    );
                                    
        var allElements     = iQ.all(iQ.allElements),

            index           = {},
            indexF          =   function(ixNode, i){
                                    var iQid        = iQ.prefixIt(i, 'iQ', '_'),
                                        attrs       = [
                                            'contextRef',
                                            'decimals',
                                            'format',
                                            'id',
                                            'name',
                                            'order',
                                            'precision',
                                            'target',
                                            'tupleRef',
                                            'scale',
                                            'sign',
                                            'unitRef'
                                        ],
                                        ixType      = ixNode.nodeName,
                                        //TODO: Accommodate all attributes, not just nonFraction's? http://www.xbrl.org/Specification/inlineXBRL-part1/PWD-2013-02-13/inlineXBRL-part1-PWD-2013-02-13.html#sec-nonFractions
                                        //TODO: Accommodate more complex content? 
                                        valueResult = {
                                            ixType          :ixType,            
                                            value           :iQ._text(ixNode),
                                            index           :i
                                        };

                                    attrs.forEach(function(attr){
                                        valueResult[attr] = iQ._attr(ixNode, attr);
                                    });
                                    //TODO: Special processing depending on ixType?


                                    //Displace their ID
                                    if(ixNode.id) ixNode.setAttribute('data-original-id', ixNode.id);
                                    ixNode.id = iQid;
                                    index[iQid] = valueResult;
                                };
            iQ._eachNodes(allElements, indexF);
        

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
iQ.att =[

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
	'unitRef'
];






///Just aliases
///Overkill?
///Probably
//iQ.q  = document.querySelector;
//iQ.qa = document.querySelectorAll;

iQ._processHeader = function()
{
  	
    var header      = iQ.first(iQ.prefixPlusIt('header', 'ix')),
        contexts    = iQ.all(header, iQ.prefixPlusIt('context', 'xbrli')),
        units       = iQ.all(header, iQ.prefixPlusIt('unit', 'xbrli'));

        //unit is used by unitWorker
            //unitWorker might delegate to numeratorWorker, denominatorWorker...
        //context is used by contextWorker
            //delegate to startWorker, endWorker, timeSpanWorker, memberWorker, axisWorker
        //TODO: Kick off unitWorker and contextWorker; they can do the de-referencing
        iQ._contexts = iQ._mapNodes(contexts, iQ._processContextNodes);
        iQ._units    = iQ._mapNodes(units, iQ._processUnitNodes);   

};

//TODO: More of these, and they can use the prefix the iXBRL doc defines
//Also provide prefixItPlus alternatives
iQ._xbrli = function(it){
    return iQ.prefixIt(it, 'xbrli');
};

iQ._processContextNodes = function (contextNode, index, nodeList)
{

        //1) date texts are ISO 8601 
        //2) they are unions of date and dateTIme
        //3) there are rules for inferring time if only a date is provided


        //In original iQ.js, I converted date texts to Date objects
        //TODO: Should I do it? Use the right rules. See iQ.dateFromIso
        //Need to accommodate not just dates, but times; and time zones!

         
        var identifierNode  = iQ.first(contextNode, iQ.prefixIt('identifier', 'xbrli')),
            periodNode      = iQ.first(contextNode, iQ.prefixIt('period', 'xbrli')),
            periodTextF     = function(text) { return iQ._text(iQ.first(periodNode, iQ.prefixIt(text, 'xbrli'))) },
            segmentMaker    = function(s) { return function(memberNode) { s[iQ._attr(memberNode, 'dimension')] = iQ._text(memberNode) }},
            startDate       = periodTextF('startDate'),
            endDate         = periodTextF('endDate'),
            instant         = periodTextF('instant'),
            forever         = new Boolean(iQ.first(periodNode, iQ.prefixIt('forever', 'xbrli'))),
            entityObject    = {
                identifier  :iQ._text(identifierNode),
                scheme      :iQ._attr(identifierNode)
            },
            segmentObject   = {},
            throwAway       = iQ._mapNodes(iQ.all(periodNode, segmentMaker(segment))),
            periodObject    = {
                startDate       :startDate,
                startDateDate   :new Date(startDate),   //See above re: method; I don't think IE Date constructors recognize ISO strings
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
        return contextResult;

};


iQ._processUnitNodes = function(unitNode, index, nodeList)
{

    //TODO: Support multiplication? Two measures?
    var measureQ        = iQ.prefixIt('measure', 'xbrli'),
        measureNodes    = iQ.all(unitNode, measureQ),
        measureNode     = measureNodes[0], //iQ.first(unitNode, measureQ),
        numeratorNode   = iQ.first(unitNode, iQ.prefixIt('numerator', 'xbrli')),
        denominatorNode = iQ.first(unitNode, iQ.prefixIt('denominator', 'xbrli')),
        unitResult = {
            id              :unitNode.id,   //.getAttribute('id'), //attributes['id'],
            measure         :iQ._text(measureNode),
            numerator       :iQ._text(iQ.first(numeratorNode, measureQ)),
            denominator     :iQ._text(iQ.first(denominatorNode, measureQ)),
            multiplicands   :iQ._mapNodes(measureNodes, iQ._text),  
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
iQ.all = iQ._qsa;


iQ._qs = function(queryStringOrNode, queryString)
{
    return iQ._q(queryStringOrNode, queryString, 'querySelector');
};

iQ.first = iQ._qs;

//Would prefer to use this for 
iQ.named = function(tagNameOrNode, tagName)
{
    return iQ._q(tagNameOrNode, tagName, 'getElementsByTagName');
};

iQ._q = function(queryStringOrNode, queryString, queryMethod)
{
    var result;
    //if null or undefined
    if (!queryStringOrNode){
        return null;
    }
    //query whole document; 
    else if (typeof(queryStringOrNode)==='string' || queryStringOrNode instanceof Array){
        return document[queryMethod](queryStringOrNode);
    }
    //first arg is a node; query its children
    else{
        return queryStringOrNode[queryMethod](queryString);
    }

};

iQ._text = function(node)
{
    return node ? node.textContent : undefined;
}

iQ._attr = function(node, attr)
{
    return !node ? 
                undefined
                : attr instanceof Array ?
                    attr.map(function(att){node.getAttribute(att); })
                    : node.getAttribute(attr);
}

///NodeList utilities
///=========================================
iQ._eachNodes = function(nodeList, eachFunction, results)
{
        /*
        var length = nodeList.length;
        results = results || {};
        results.map = results.map || [];

        for (var i=0, i<length, i++)
        {
            results.map.push(eachFunction(nodeList[i], i, nodeList));
        }
        */

    [].forEach.call(nodeList, eachFunction);
}

iQ._mapNode = function(nodeList, eachFunction)
{
    /*
    results = {};
    iQ._eachNodes(nodeList, eachFunction, results);
    return results.map;
    */
    [].map.call(nodeList, eachFunction);
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

iQ._index();
iQ._workerSetup();