
iQ = function(oOptions){

    this.index();
}


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


///A map-ready function-creator
///Given first-level attributes prefix and escape
///Returns function that appends element
iQ.prefixThem = function(prefix, escaped){
    var joiner = ':';
    if (typeof(escaped)==='string') joiner= escaped;
    else if (escaped || escaped===undefined) joiner = '\\:';
    return function(element, index, array) {
        return prefix+joiner+element;
    };
};

iQ.prefixIt = function(it, prefix, escaped) {
    return iQ.prefixThem(prefix, escaped)(it);
}


 iQ._index = function () {


        var allElements = document
                            .querySelectorAll(
                                    iQ.elements.concat(   
                                        iQ.elements.map(
                                            iQ.prefixIt('ix')))),
            
        iQ._values = iQ._mapNodes (allElements


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
  	
    var header      = document
                        .querySelector(iQ.prefixIt('header', 'ix')),             //Only one header; not "querySelectorAll"
        contexts    = header
                        .querySelectorAll(iQ.prefixIt('context', 'xbrli')),
        units       = header
                        .querySelectorAll(iQ.prefixIt('unit', 'xbrli'));

        iQ._contexts = iQ._mapNode(contexts, iQ._processContextNodes);
        iQ._units    = iQ._mapNode(units, iQ._processUnitNodes);   

};

iQ._processContextNodes = function (node, index, nodeList)
{

};

iQ._processUnitNodes = function(unitNode, index, nodeList)
{


        unitResult = {
            id              :unitNode.getAttribute('id'), //attributes['id'],
            measure         :unitNode.querySelector(iQ.prefixIt('measure', 'xbrli')),
            numerator       :'',
            denominator     :'',
            results         :[],           
            count           :0
        }



        jMeasure = jUnit.find('xbrli\\:measure');
        if (jMeasure.length >0){
            oUnit.measure = jMeasure.text();
        }
        else{

            jDivide = jUnit.find('xbrli\\:divide');
            //TODO: Support multiplication
            //jMultiply = jUnit.find('xbrli\\:multiply');

            oUnit.numerator = jDivide.find('xbrli\\:numerator>xbrli\\:measure').text();
            oUnit.denominator = jDivide.find('xbrli\\:denominator>xbrli\\:measure').text();
        }

        
        this.unitRef[sUnitId] = oUnit;
};



///Array utilities
///=========================================
iQ._eachNode = function(nodeList, eachFunction, results)
{
        var length = nodeList.length;
        results = results || {};
        results.map = results.map || [];

        for (var i=0, i<length, i++)
        {
            results.map.push(eachFunction(nodeList[i], i, nodeList));
        }
}

iQ._mapNode = function(nodeList, eachFunction)
{
    results = {}
    iQ._eachNode(nodeList, eachFunction, results);
    return results.map;
}

iQ.prototype.average = function()
{
    var sum=0;
    var count =0;
    this.values().forEach(function(v,i,a){
        sum+=v;
        count++;
    })
    return sum/count;
}

iQ.prototype.makeFilterStats = function(){

    if (!this.filterStats)
    {
        this.filterStats = $('#filterStats');

    }

    if(this.filterStats.length==0)
    {
        this.filterStats = $('<div></div>').attr('id', 'filterStats').append($('<table></table>').prepend($('<thead></thead>'), $('<tbody></tbody>'))).appendTo('html');
    }
}

iQ.prototype.makeConsole = function(){
    /*
    makeConsole: function()
    {
    */

            if (!this.iQconsole)
            {
                this.iQconsole = $('#iQconsole');

            }

            if ($('#iQconsole').length==0)
            {

                this.body.on('iQ_filterStats',  $.proxy(this.showFilterStats, this));
                this.iQconsole = $('<div></div>').attr('id', 'iQconsole').appendTo('html');
            }

    /*
    }
    */
}

  $(document).ready(function(){


      q = new iQ();
  });

