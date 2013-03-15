
iQ = function(oOptions){

    this.setOptions(oOptions);
    this.processHeader();
    this.getElements();
	this.bindEvents();
	//this.initiXbrl();

	//this.addResourceTable();
    this.alliX();
	}




iQ.prototype.setOptions = function (oOptions) {


    //TODO: Do we need to rely on jQuery?
    this.o = $.extend(
                    {
                        url: 'http://www.xbrl.org/inlinexbrlextractortutorial/MassiveDynamic.html',
                        inflate: true,
                        loadDts: false,
                        types: [], //Means to use iQ.el
                        sortBy: 'dom',
                        strict: false,
                        target: 'body'
                    },
                    oOptions);

    this.contextRef = {};
    this.unitRef = {};
    this.nameRef = {};
    this.oResultSet = [];

}



iQ.prototype.getElements = function ()
{
    lPreQualElements = this.iX.slice(0);
    sPreQualElements = lPreQualElements.join(',');
    jPreQualElements = $(sPreQualElements);

    this.jAllSet = jPreQualElements.slice(0);
    this.jResultSet = jPreQualElements.slice(0);
    this.jExcludeSet = $('');
    this.jResultSetTemp = [];
    this.jExcludeSetTemp = [];

    
        this.jResultSet.each(
            $.proxy(this.getResults, this));
    
}

iQ.prototype.inflate = function(oResult, jResult)
{
    if (jResult===undefined)
    { return undefined;
    }

    $.each(oResult, function(propName, propValue){
        jResult.data(propName, propValue);
    });
    jResult.data('result', oResult);
}
iQ.prototype.getResults = function (index, result)
{
    var jResult = $(result),
    sContextId = jResult.attr('contextref') || 'none',
    sUnitId = jResult.attr('unitref') || 'none',
    cRef = this.contextRef[sContextId],
    uRef = this.unitRef[sUnitId]; 

    if (uRef === undefined) {

        if (jResult.attr('name') == undefined) {
            console.log('no name');
        }
        uRef = '';
        console.log("uRef for " + jResult.attr('name') + " is undefined. name is " );
    }

    if (cRef === undefined) {
        cSegment = '';
        cEntity = '';
        cPeriod = { 'startDate': '', 'endDate': '', 'instant': '' };
    }

    else {

        cSegment = cRef.segment;
        cEntity = cRef.entity

        cPeriod = cRef.period;
    }
 
    if ($.isEmptyObject(cSegment)) {
        cSegment = '';
    }

    oResult = {            //this.getxObj(
        'name': jResult.attr('name'),
        'contextRef': sContextId,
        'startDate'     : cPeriod.startDate,
        'endDate'       : cPeriod.endDate,
        'instant'       : cPeriod.instant,
        'dimensions': cSegment,
        'entity': cEntity.identifier,
        'unitRef': sUnitId,
        'measure': uRef.measure,
        'numerator': uRef.numerator,
        'denominator': uRef.denominator,
        'ixType'        : jResult[0].nodeName
    };


    if (this.o.inflate)
    {
        this.inflate(oResult, jResult);

    }
        this.oResultSet.push(oResult);

        if(!$.isEmptyObject(this.contextRef))
        {

            if(this.contextRef[sContextId].results===undefined)
            {

             this.contextRef[sContextId].results=[];
            }

            this.contextRef[sContextId].results.push(oResult);
            this.contextRef[sContextId].count++;

        }

        if(!$.isEmptyObject(this.nameRef))
        {

            if (this.nameRef[oResult.name] === undefined) {
                this.nameRef[oResult.name] = {};
                this.nameRef[oResult.name].results = [];
                this.nameRef[oResult.name].count = 0;
            }
            this.nameRef[oResult.name].results.push(oResult);
            this.nameRef[oResult.name].count++;

        }

        if(!$.isEmptyObject(this.unitRef))
        {


            this.unitRef[sUnitId].results.push(oResult);
            this.unitRef[sUnitId].count++;
        
        }
    //TODO: A count of segments
    //TODO: Units
    //Etc

    


}

/*
iQ.prototype.getxObj = function (options) {
}*/


iQ.prototype.element = function (oElementOptions) {

    //TODO: Need to express "not" in string syntax
    var filterOptions = {},
        listOptions = [],
        //TODO: 
        isArray = (typeof oElementOptions.constructor == (new Array()).constructor),
        isString = (typeof oElementOptions == "string"),
        isObject = (typeof oElementOptions.constructor == ({}).constructor),
        isRegEx = (typeof oElementOptions.constructor == (new RegExp()).constructor);

    if (isArray) {
        listOptions=oElementOptions
    }
    
    else if (isString) {

        //Rename for explicitness
        var stringOptions = oElementOptions,
        //Equivalencies. Reduce to one of two delimiters: 
        //',' means 'or'
        //'>' means 'and'
        orDelimiter = ',',
        andDelimiter = '>';

        oElementOptions = stringOptions
                                    .replace('||',  orDelimiter)
                                    .replace('|',   orDelimiter)

                                    .replace('&',   andDelimiter)
                                    .replace('&&',  andDelimiter);

        var orDelimited = stringOptions.indexOf(orDelimiter)>-1;
        var andDelimited = stringOptions.indexOf(andDelimiter)>-1;

        if (orDelimited && andDelimited)
        {
            throw 'iQ cannot handle both commas and greater-than signs for now.';
        }

        //For example, iQ.element('assets, liabilities'), they want both.
        if (orDelimited) 
        {
            listOptions = stringOptions.split(orDelimiter);
            this.logic = 'or';

        }

        //For example, iQ.element('assets> current'), they want, of assets, the current variety.
        else if (andDelimited) 
        {
            listOptions = oElementOptions.split(andDelimiter);

        }

        else
        {

            //There are no delimiters; this will produce a single-length string. Skip it?
            listOptions =  oElementOptions.split(andDelimiter+orDelimiter);
        }
    }

    if (listOptions!==[]) 
    {
        var tempListOptions = [];

        listOptions.forEach(function(value, index, array){
            value = value.trim();
            if (value!='') tempListOptions.push(value); // TODO: Better "empty string" checking?
        });

        listOptions = tempListOptions;

        if (listOptions.length==0)
        {
            throw 'After striping whitespace, iQ cannot find any strings. Empty filter?';
        }
        if (listOptions.length>1)
        {
            //Providing a list of strings is the equivalent of successive element calls with single strings
            //iQ.element('asset').element('current');

            //TODO: Use forEach https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
            listOptions.forEach(function(value, index, array){
                this.element(value)});
        }
        if (listOptions.length==1)
        {

            //A single string is provided, which is equivalent to element call with object syntax
            //iQ.element({any:'asset'});
            //But I work on string syntax before object syntax

            continue;
        }
    }
        filterOptions = { 'searchString': oElementOptions, 'caseSensitive': false };
        var jFilterResultSet, jEachResultSet;

        //Filtering the jResultSet using $().filter() (or the JS 1.6 native Array filter method) is between 1.5 and 3x faster than the approach below
        //However, with a filtering approach, iQ cannot direct results into excluded or included
        //Caching excluded speeds up 'or' searches
        //Consider using filter() if a user does not care about 'and'

        /*var bFilter = false;
        if (bFilter) {
            bf = new Date();
            this.jResultSet = this.jResultSet.filter(function () { return iQ.StringQuery.contains(this, filterOptions) });
            af = new Date();
            console.log('after filtering ' + (af - bf));
        }

        else {*/

            be = new Date();
            this.result_and(this.contains, filterOptions);
            ae = new Date();
            console.log('after eaching ' + (ae - be));
        //}

    }

    else if (isRegEx) {
        console.log('regex');
    }
    else if (typeof oElementOptions.constructor == ({}).constructor) {

        //TODO: Figure out how any:true and all:true affect the below...
        //Any is equivalent to all of them with or
        //All is equivalent to all of them with and;
        //So if any or all is specified, ATTRIBUTES is automatically all of them
        //Else ATTRIBUTES are only what they specify...

        var attributes = ['name', 'definition', 'terseLabel'];
        if (oElementOptions.any !== undefined) {
            oElementOptions.logic = 'or';

        }
        else if (oElementOptions.all !== undefined) {
            oElementOptions.logic = 'and';

        }
        else {
            //Default internal logic for string is or
            //This is a String Query
            oElementOptions.logic = oElementOptions.logic || 'or';
            tempAttributes = [];
            for (i in attributes) {
                //Only if they've specified the attribute!
                if (oElementOptions[attributes[i]] !== undefined) {
                    tempAttributes.push(attributes[i]);
                }
            }
            attributes = tempAttributes;

        }

        //These all need to be inflated into data() or added to oResults...



    }

    return this;
}

if(!iQ.StringQuery) {iQ.StringQuery = {};}

iQ.prototype.result_or = function(eachFunc, options)
{
    
    $.extend(this.o, options);
    //Searching among those who have been discarded; 
        //Don't search those already confirmed, they're already confirmed; this is OR!
        //Search those which have been disqualified (this.jExcludeSet), they could still be confirmed; this is OR!
    this.jExcludeSet.each($.proxy(eachFunc, this));

    //Add to jResultSet; it just gets bigger! This is OR!
    this.jResultSet = this.jResultSet.add($(this.jResultSetTemp));
    //ExcludeSet gets smaller! This is OR!
    this.jExcludeSet = $(this.jExcludeSetTemp);
    this.jResultSetTemp = [];

    this.jExcludeSetTemp = [];
}

iQ.prototype.result_and = function(eachFunc, options)
{
    $.extend(this.o, options);
    this.jResultSet.each($.proxy(eachFunc, this));

    //Remove from jResultSet; it just ets smaller! This is AND!
    this.jResultSet=$(this.jResultSetTemp);
    this.jExcludeSet = this.jExcludeSet.add($(this.jExcludeSetTemp));
    this.jResultSetTemp = [];
    this.jExcludeSetTemp = [];
}


iQ.prototype.result = function(i, domResult) { 
    //These could be searching the ResultSet, if it is AND, else the ExcludeSet, if it is OR
    jResult = $(domResult);
    if (iQ.StringQuery.contains(jResult, this.o)) {
        this.jResultSetTemp.push(jResult)
    }
    else {
        this.jExcludeSetTemp.push(jResult);
    }
    
};

iQ.StringQuery.contains = function(result, options)
{
    var jResult = $(result);
    var sName = jResult.data('name');
    var sSearchString = options.searchString;
    if (!options.caseSensitive) {
        sName = sName.toLowerCase();
        sSearchString = sSearchString.toLowerCase();
    }
    
    
    
        return sName.indexOf(sSearchString)>-1;
    //Inside of these, this refers to the jResult
}


iQ.prototype.getUnitRef = function(index, domUnit){
    

        jUnit = $(domUnit);
        oUnit = {};
        oUnit.measure =  '';
        oUnit.numerator= '';
        oUnit.denominator = '';
        oUnit.results = [];
        oUnit.count = 0;


        if (!this.unitRef['none']) {
            this.unitRef['none'] = oUnit;
        }

        sUnitId = jUnit.attr('id');

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
    }

iQ.prototype.getContextRef = function(index, domContext){
{
    
        jContext = $(domContext);

        oContext = {};
        oContext.entity = {};
        oContext.period = {};
        oContext.segment = {};
        oContext.results = []; //In inflate, this happens
        oContext.count = 0;
        //oContext.scenario = {};


        sContextId = jContext.attr('id');

        jEntityIdentifier = jContext.find('xbrli\\:entity>xbrli\\:identifier');
        oContext.entity.identifier = jEntityIdentifier.text();
        oContext.entity.scheme =	 jEntityIdentifier.attr('scheme'); 

        jPeriod = jContext.find('xbrli\\:period');
        lPeriods = ['startDate', 'endDate', 'instant']
        for (i in lPeriods)
        {
            sEl = lPeriods[i];
            jEl = jPeriod.find('xbrli\\:' + sEl);
            oContext.period[sEl] =  jEl.length>0? new Date(jEl.text()): '';
				
        }
        jSegment = jContext.find('xbrli\\:segment');
        jSegment.find('xbrldi\\:explicitmember').each(
            function(index, domExplicitMember)
            {
                jExplicitMember = $(domExplicitMember);
                sAxis = jExplicitMember.attr('dimension');
                sMember = jExplicitMember.text();
                oContext.segment[sAxis] = sMember;
            })

        this.contextRef[sContextId] = oContext;


    }


}

iQ.prototype.bindEvents = function()
{


    //TODO: Must load all synonyms here and point them at the proper functions!

}

iQ.prototype.initiXbrl = function()
{
/*
	$.ajax({
		type: 'GET'
		url: this.o.url,

	});
*/

$(this.o.target).load(this.o.url, function(){console.log('Loaded iXBRL');});
}


iQ.format = function() 
{}();
//http://www.xbrl.org/Specification/inlineXBRL-part0/REC-2010-04-20/inlineXBRL-part0-REC-2010-04-20.html#sec-transformation



/*
Why: 
	Validate iXBRL is valid
	Ensure we could perform other processes, like iQ.process
Links:
	http://www.xbrl.org/Specification/inlineXBRL-part0/REC-2010-04-20/inlineXBRL-part0-REC-2010-04-20.html#d1e367

*/
iQ.validate = function(){};
 // 

/*
Why: 
	Produce XBRL Output
Link:
	http://www.xbrl.org/Specification/inlineXBRL-part0/REC-2010-04-20/inlineXBRL-part0-REC-2010-04-20.html#d1e367

*/

 iQ.process = function(){};


//http://www.xbrl.org/Specification/inlineXBRL-part1/REC-2010-04-20/inlineXBRL-part1-REC-2010-04-20.html#sec-prefixes
 iQ.nsMap =  {
		'ix':		'http://www.xbrl.org/2008/inlineXBRL',
		'ixt':	'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20',
		'link':	'http://www.xbrl.org/2003/linkbase',
		'xbrli':	'http://www.xbrl.org/2003/instance',
		'xl':		'http://www.xbrl.org/2003/XLink',
		'xlink':	'http://www.w3.org/1999/xlink',
		'xml':	'http://www.w3.org/XML/1998/namespace',
		'xsi':	'http://www.w3.org/2001/XMLSchema-instance'
 };


/*
Why:
	To quickly find all elements
Link:
	http://www.xbrl.org/Specification/inlineXBRL-part1/REC-2010-04-20/inlineXBRL-part1-REC-2010-04-20.html#table-inlinexbrlelements
Note:
	These are "Inline XBRL Elements". Any element not in this list is called a "Markup Element"
*/
 iQ.el = ['nonFraction'
,'nonNumeric'
,'denominator'
,'exclude'
,'footnote'
,'fraction'
,'header'
,'hidden'
,'numerator'
,'references'
,'resources'
, 'tuple'];

 iQ.nonValue = [
     'header',
     'exclude',
     'references',
     'resources',
     'hidden',
     'footnote'
 ];

 iQ.prototype.valueEl = (function () {
     results = [];
     for (i in iQ.el) {
             if (iQ.nonValue.indexOf(iQ.el[i]) == -1) {
                 results.push(iQ.el[i]);
             }
             
        }
     return results;
 })();

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



  iQ.prototype.iX = function(){
  	u = iQ.prototype.valueEl.slice(0);
  	q=[];
  	for (i in u)
		{
			q.push('ix\\:' + u[i]);
		}
  	return q;
  }();


  iQ.prototype.alliX = function()
  {

  	jPreQualElements.css('background-color', 'yellow');

  }



iQ.prototype.addResourceTable= function () {

$('<table>')
.append(

	$('<tr>')
		.append(
			$('<th>').text('ContextRef'),
			$('<th>').text('Context Start'),
			$('<th>').text('Context End'),
			$('<th>').text('Context Instant')
			)
		,
	$.map(	this.contextRef, 
			function(value, key)
			{ 
				return $('<tr>').append(
				$('<td>').text(key),
				$('<td>').text(value.period.startDate),
				$('<td>').text(value.period.endDate),
				$('<td>').text(value.period.instant))
			}
		)
	).appendTo($(this.o.target));
};



  iQ.prototype.processHeader = function()
  {
  	



  	$('ix\\:header').find('xbrli\\:context').each(
  		$.proxy(
  		this.getContextRef, this));

  	$('ix\\:header').find('xbrli\\:unit').each(
$.proxy(this.getUnitRef, this));





};

  $(document).ready(function(){




      q = new iQ();
  });