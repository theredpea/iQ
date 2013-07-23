
iQ = function(oOptions){

    this.setOptions(oOptions);
    //Put these things in an iQ namespace so other iQs can get them?
    this._processHeader();
    this.getElements();
    
    this.makeConsole(); // was this.console.makeConsole();
    this.makeFilterStats();
	//this.initiXbrl();

	//this.addResourceTable();
    this.alliX();
    this.bindEvents();

	}


iQ.prototype.showFilterStats = function(e)
{

e.preventDefault();
e.stopPropagation();
if($('thead>tr',this.filterStats).length==0)
{

    $('thead', this.filterStats).append($('<tr></tr>').append(

        $.map(e.stats, function(value, property){
            return $('<th></th>').text(property);

            })

        ))
}

$('#filterStats tbody').append($('<tr></tr>').append(

        $.map(e.stats, function(value, property){
            return $('<td></td>').text(value);

            })

        )
    );

}

//TODO:  Run this through results, so the user can see the number of results/included go back to all possible results? 
//Even though this shouldn't take long, and so duration info may not be meaningful.
iQ.prototype.all = function()
{


    this.jResultSet = this.jAllSet;
    return this;

}

iQ.prototype.bindEvents = function()
{



    //TODO: Must load all synonyms here and point them at the proper functions!
    
    var eventArgs=  [
        ['click', '[name]', $.proxy(this.click_tag, this)],
        ['click', '.popover .close', $.proxy(this.click_popoverClose, this)]
        
    ];

    //(Bad?) Way to prevent attaching multiple listeners.
    eventArgs.forEach($.proxy(function(ev, index, eventArgs){
        
        /*this.body.off(ev[0]);
        if (ev.length==2){
            this.body.on(ev[0], ev[1]);
        }
        else if (ev.length==3)
        {
            */
            this.body.on(ev[0], ev[1], ev[2]);
        /*}*/

    }, this));


    //this.body.on('click', '[name]', $.proxy(this.click_tag, this));
    //this.body.on('iQ_filterStats',  $.proxy(this.showFilterStats, this));
    //this.body.on('click', '.popover .close', $.proxy(this.click_popoverClose, this));

    this.body[0].addEventListener('drop', function(e){alert('dropped');});

    ['dragstart', 'dragend'].forEach($.proxy(function(e, index, array){

        //TODO: These events will fire any time anything is dragged, not just stickers, because I removed jQuery's context. However, only stickers are draggable=true

        this.body[0].addEventListener(e, $.proxy(this[e+'_sticker'], this));

    }, this));


    ['dragenter', 'dragleave', 'dragover', 'drop', 'mouseleave'].forEach($.proxy(function(e, index, array){

        this.iQconsole[0].addEventListener(e, $.proxy(this[e+'_iQconsole'], this));
    }, this));

    this.iQconsole.on('mouseleave', $.proxy(this.mouseleave_iQconsole, this));

}



iQ.prototype.setOptions = function (oOptions) {

    this.body = $('body');

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
    this.operator='and';
    this.jResultSet = $();
    this.jExcludeSet = $();
    this.jResultSetTemp = $();
    this.jExcludeSetTemp = $();

}


iQ.prototype.and = function()
{

    this.operator='and';
    return this;
}

iQ.prototype.or = function()
{

    this.operator='or';
    return this;
}


iQ.prototype._measureIt = function(func, callIt, timeResults)
{
    timeResults = timeResults || [];
    var startDate = new Date();
    func();
    var endDate = new Date();
    var timing = (endDate-startDate);

    timeResults.push(timing);
    console.log(callIt + ' took ' + timing + ' ms');

};

iQ.prototype.getElements = function ()
{
    //Copy iX
    var lPreQualElements = this.iX.slice(0),
        sPreQualElements = lPreQualElements.join(','),
        nPreQualElements = iQ.iXElements || document.querySelectorAll(lPreQualElements);

    iQ.iXElements = nPreQualElements;
    jPreQualElements = $(nPreQualElements);

    this.jAllSet = jPreQualElements.slice(0);
    this.jResultSet = jPreQualElements.slice(0);
    this.jExcludeSet = $('');
    this.jResultSetTemp = $();
    this.jExcludeSetTemp = $();
    this.history={};
    //Represents inter logic, not intra logic
	this.logic = 'and';

    
        this.jResultSet.each(
            $.proxy(this._inflateResults, this));
    
}

iQ.prototype._inflate = function(oResult, jResult, options)
{

    options = $.extend({bPopover:false}, options);
    if (jResult===undefined)
    { return undefined;
    }

    inflateFunc = function(propName, propValue){
        //TODO: A solution for handling data-axis-us-gaap_StatementEquityComponents, which would become very funny-looking
        //TODO: A solution for lowercasing? See inflateResults
        propName = propName.replace(/([a-z])([A-Z])/g, function(match, first, second) { return first + '-' + second.toLowerCase(); });//$1-$2');

        if (propValue || (typeof(propValue) == typeof({}) &&  Object.keys(propValue).length==0))
        {
            jResult.data(propName, propValue);
            jResult.attr('data-'+propName, propValue);
        }
        if (options.bPopover)
        {
            
            jResult.popover(
                {
                    html:true,
                    content:this.tagPopoverHtml(jResult),
                    title:'Tag Info <span class="close">x</span>',
                    placement:'top'
                }
            );
            
        }
    };

    //Put each 
    $.each(oResult, $.proxy(inflateFunc, this));
    //And cram the whole object there for reference? Excessive
    //jResult.data('result', oResult);
}


iQ.prototype._inflateResults = function (index, result)
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
    //Consider aligning more closely with the properties described here (or on whichever ix: element allows the most )
    //http://www.xbrl.org/Specification/inlineXBRL-part1/PWD-2013-02-13/inlineXBRL-part1-PWD-2013-02-13.html#sec-nonFractions
    var name =jResult.attr('name'),
        oResult = {            //this.getxObj(
            'name'              : name.toLowerCase(),           //For case-insensitive matches; the default (we always lowercase the searchstring passed by user)
            'conceptName'       : name,
            'localName'         : name.split(':')[1],
            'prefix'            : name.split(':')[0],
        //   'periodType'        : Tax.periodType(name),        //Should be a constraining facet; but can asset indirectly? Ensuring startDate, endDate and instant are all equal?
        //   'balanceType'        : Tax.balanceType(name),
            'contextRef'        : sContextId,
            'startDate'         : cPeriod.startDate,
            'endDate'           : cPeriod.endDate,
            'instant'           : cPeriod.instant,
            'dimensions'        : cSegment,
            'entity'            : cEntity.identifier,
            'unitRef'           : sUnitId,
            'measure'           : uRef.measure,
            'numerator'         : uRef.numerator,
            'denominator'       : uRef.denominator,
            'ixType'            : jResult[0].nodeName
        },
        oDimensions={};

    $.each(cSegment, function(axis, member) { oDimensions['axis-'+axis.replace(':','_')] = member; });
    

    oResult = $.extend(oResult, oDimensions);



    //Data attributes for each axis


    if (this.o.inflate)
    {
        this._inflate(oResult, jResult);

    }
        this.oResultSet.push(oResult);

        //------------------CONTEXTREF
        if(!$.isEmptyObject(this.contextRef) && this.contextRef[sContextId]!==undefined)
        {

            if(this.contextRef[sContextId].results===undefined)
            {

             this.contextRef[sContextId].results=[];
            }

            this.contextRef[sContextId].results.push(oResult);
            this.contextRef[sContextId].count++;

        }
        //------------------NAMEREF
        if(!$.isEmptyObject(this.nameRef) && this.nameRef[oResult.name]!==undefined)
        {

            if (this.nameRef[oResult.name] === undefined) {
                this.nameRef[oResult.name] = {};
                this.nameRef[oResult.name].results = [];
                this.nameRef[oResult.name].count = 0;
            }
            this.nameRef[oResult.name].results.push(oResult);
            this.nameRef[oResult.name].count++;

        }

        //------------------UNITREF
        if(!$.isEmptyObject(this.unitRef) && this.unitRef[sUnitId]!==undefined)
        {


            this.unitRef[sUnitId].results.push(oResult);
            this.unitRef[sUnitId].count++;
        
        }

    //TODO: A count of segments

    


}

/*
iQ.prototype.getxObj = function (options) {
}*/

//Gives defaults?

iQ.prototype._sortByFilter = function(oFilter)
{
    sortByList = [];
    Object.keys(oFilter).forEach(function(element, index, array)
    {

        sortByList.push({
            element: 'ascending'});

    }, this);
    return sortByList;

}


iQ.prototype._elementFilter = function (oElement) {
    var filter = {};
    if (typeof (oElement) == typeof (new String())) {
        oElement =
            {
                any: this._stringFilter(oElement),
                sortBy : 'name'
            };
    }

    if (typeof (oElement) == typeof (new Object())) {
        var lElementProperties = Object.keys(oElement);

        //For example, 
/*

                    {
                        contains: oElement,
                        caseSensitive: false,
                        sortBy:'name'   //TODO: Figure out how a sortObject works, and what is its default? Its parent key ascending?
                    }
*/

        //Any trumps everything else
        var elementProperties = Object.keys(this._elementFilterDoc());

        if (lElementProperties.indexOf('any') > -1) {
            delete oElement.all; //"any" trumps "all"; should not matter, they are mutually exclusive because of if/else
            anyStringFilter = lElementProperties.any;
            elementProperties.foreach(function (element, index, array) {
                if (element !== 'any' && element !== 'all') { //So like 'doc', 'ref', 'label', 'name'
                    //Q: Do I need to make a copy?
                    //I don't ever change this thing,
                    //http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
                    filter[element] = anyStringFilter; //
                    
                }
            }, this);

            //Any does 'or' logic, even if the user specified 'and'
            filter.logic = 'or';

                //Extend /overwrite the defaults.
            //filter.sortBy = $.extend(this._sortByFilter(filter), filter.sortBy);
                //Or: don't use defaults unless they provided nothing
            //filter.sortBy = filter.sortBy | this._sortByFilter(filter);



        }

        else if (lElementProperties.indexOf('all') > -1) {

            allStringFilter = this._stringFilter(lElementProperties['all']); //lElementProperties.all;

            elementProperties.foreach(function (element, index, array) {
                if (element !== 'any' && element !== 'all') {
                    filter[element] = allStringFilter; //

                }
            }, this);

            //Any does 'and' logic, even if the user specified 'or'
            filter.logic = 'and';
            filter.caseSensitive = oElement.caseSensitive || 'false';
        }

        else {
            filter = oElement;
        }
        
    }

    return filter;

};

iQ.prototype._labelFilterDoc = function () {


}

iQ.prototype._elementFilterDoc = function () {
    //Keep in mind that the target object (first argument) will be modified, and will also be returned from $.extend()
    var o= 
    {
        doc:    this._stringFilterDoc(),	//*
        lab:    this._stringFilterDoc(),    //*
        ref:    this._stringFilterDoc(),    //*
        name:   this._stringFilterDoc(),    //*
        any:    this._stringFilterDoc(),    //If any is used, it overrides everything else	. Any is equivalent to an elementFilter with all of the *singular, with the logic 'or'
        all:    this._stringFilterDoc(),    //If all is used, it overrides everything else except any. All is equivalent to an elementFilter with all of the *singular, with the logic 'and'
        logic:  new String(), //	new Boolean(),
        sortBy: new Array()

        //*If many of these are supplied, there is an implicit or treatment

    };
    return o;
}


iQ.prototype._stringFilter = function (oString) {

var filter = {};
if(typeof oString == 'string')
{
    filter =
        {
            contains: oString,
            caseSensitive: false

        };
}
else if (typeof oString == 'object')
{
	filter = $.extend({
			caseSensitive: false
			},
			oString);

}

    return filter;
}
//TODO: Can I pull off iQ.prototype._doc.stringFilter? 
iQ.prototype._stringFilterDoc = function (oString) {

    var o=
    {
	equals:		new String(),
        startsWith:     new String(),
        endsWith:       new String(),
        contains:       new String(),
        matches:        new RegExp(),
        caseSensitive:  new Boolean()
	//logic:	new String() 'and'|'or'		//No interstitial logic on a string query, yet. Use case not compelling. startsWith and endsWith? Shouldn't it just be equals? If not, what are the chances it would've changed?

    };
    return o;
   
}

iQ.prototype.ascending = function (prev, next) {

}
iQ.prototype.sort = function () {
    var o = {
        ascending: 'ascending',         //this.ascending, TODO: Actually make functions? How do you plan to sort?
        descending: 'descending'        //this.descending
        
    };
    return o
}

iQ.prototype._elementSortDoc = function(oSort)
{
    var filterKeys = Object.keys(this._elementFilterDoc()),
    o = {};
    filterKeys.forEach(function (element, index, array) {
        o[element] = this.sort().ascending;
    }, this);

}

iQ.prototype._isiq = function(o)
{
    return o.constructor == this.constructor;
};

iQ.prototype.add = function(iQobject)
{

    if (!this._isiq(iQobject))
        return 
};

iQ.prototype.element = function (oElementOptions) {

    //TODO: Need to express "not" in string syntax
    var searchString,
        iQinstruction={},
        filterOptions = {},
        listOptions = [],
        //TODO: 
        isArray = (typeof oElementOptions.constructor == (new Array()).constructor),
        isString = (typeof oElementOptions == "string"),
        isObject = (typeof oElementOptions.constructor == ({}).constructor),
        isRegEx = (typeof oElementOptions.constructor == (new RegExp()).constructor);
    
    oElementOptions = oElementOptions || '';

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
                                    .replace(/\|+/g,  orDelimiter)
                                    .replace(/\&+/g,  andDelimiter);

        var orDelimited = stringOptions.indexOf(orDelimiter)>-1;
        var andDelimited = stringOptions.indexOf(andDelimiter)>-1;

        if (orDelimited && andDelimited)
        {
            throw 'iQ.element cannot do both "and" and "or" logic';
        }

        //For example, iQ.element('assets, liabilities'), they want both.
        if (orDelimited) 
        {
//TODO: A code path which does not split them and run through the method once for each, but which sends a list down the line and evaluates each element against all string operands in a single .forEach (rather than repeating .forEach)
            listOptions = stringOptions.split(orDelimiter);
            this.logic = 'or';

        }

        //For example, iQ.element('assets> current'), they want, of assets, the current variety.
        else if (andDelimited) 
        {
            listOptions = oElementOptions.split(andDelimiter);
		this.logic = 'and';

        }

        else
        {

            //There are no delimiters; this will produce a single-length string. Skip it?
            listOptions =  oElementOptions.split(andDelimiter+orDelimiter);
        }
    }
	if(listOptions==[] || listOptions.length<0)
	{

	   throw 'iQ.element was called with an empty list';
	}
    else 
    {
        var tempListOptions = [];

        listOptions.forEach(function(value, index, array){
            value = value.trim();
            if (value!='') tempListOptions.push(value); // TODO: Better "empty string" checking?
        });

       
        
        listOptions = tempListOptions;

        var startTime = new Date();
        this.history[startTime] = {};
        
        if (listOptions.length==0)
        {
            throw 'iQ.element stripped whitespace which left an empty list';
        }
        if (listOptions.length>1)
        {
            //Providing a list of strings is the equivalent of successive element calls with single strings
            //iQ.element('asset').element('current');

            //So this is a recursive function. Can those be optimized.
            listOptions.forEach(function(value, index, array){
                this.element(this._elementFilter(value))}, this);
            //Need method chaining
            return this;
        }
        if (listOptions.length==1)
        {

            //A single string is provided, which is equivalent to element call with object syntax
            //iQ.element({any:'asset'});
            //But I work on string syntax before object syntax
            searchString = listOptions.pop(); //Or listOptions[0]?

            filters = this._elementFilter(searchString);

        }
    }

	if(isObject)
	{
        throw 'iQ.element does not support object filters yet';
		//filters = oElementOptions;
	}
        

        var jFilterResultSet, jEachResultSet;


        //What is this?!
        /*
        iQinstruction = this.history[startTime].iQinstruction = listOptions.map($.proxy(function (value) {
            
        }, this));
*/
	

    //Could be multiple filters, 
    //Like name contains, etc etc
	for(elementProperty in filters)
	{
		elementPropertyValueFunction = this.element['get_'+elementProperty];
		
		stringFilter = filters[elementProperty];

		for(stringProperty in stringFilter)
		{
			stringPropertyValueFunction = this.string['filter_'+stringProperty];
        		be = new Date();
	

        		this['result_'+this.logic](elementPropertyValueFunction, this.propertyFunction),
        		ae = new Date();
        		console.log('after eaching ' + (ae - be));
		}
	}
    //}

    

    if (isRegEx) {
        throw 'iQ.element does not support RegExes yet';
    }
    if (typeof oElementOptions.constructor == ({}).constructor) {

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


iQ.string = {};

iQ.string.caseAdjust = function(str, operand, stringFilter)
{
	if (stringFilter.caseSensitive==true 
		|| stringFilter.caseSensitive.toLowerCase()=='true')
	{
		str=str.toLowerCase();
		operand=operand.toLowerCase();
	}

}

iQ.string.filter_contains = function(str, operand, stringFilter)
{
	return str.indexOf(operand)>-1;
}

iQ.string.filter_startsWith = function(str, operand, options)
{
	return str.indexOf(operand)==0;
}

iQ.element={};

iQ.element.get_doc =function(xbrlValue)
{

return 'documentation has assets';

}

iQ.element.get_name = function(xbrlValue)
{

}
 
if(!iQ.StringQuery) {iQ.StringQuery = {};}

iQ.prototype.filter = function(index, element)
{


    if(this.filterFunc($(element)))
    {

        this.jResultSetTemp = this.jResultSetTemp.add($(element));
    }
    else
    {

        this.jExcludeSetTemp = this.jExcludeSetTemp.add($(element));
    }
}

iQ.prototype.result_or = function()
{
    //Used to allow options
    //$.extend(this.o, options);
    //Searching among those who have been discarded; 
        //Don't search those already confirmed, they're already confirmed; this is OR!
        //Search those which have been disqualified (this.jExcludeSet), they could still be confirmed; this is OR!
    this.jExcludeSet.each($.proxy(this.filter, this));

    //Add to jResultSet; it just gets bigger! This is OR!
    this.jResultSet = this.jResultSet.add($(this.jResultSetTemp));
    //ExcludeSet gets smaller! This is OR!
    this.jExcludeSet = $(this.jExcludeSetTemp);
}

iQ.prototype.result_and = function()
{
    //Used to allow options
    //$.extend(this.o, options);

    this.jResultSet.each($.proxy(this.filter, this));

    //Remove from jResultSet; it just ets smaller! This is AND!
    this.jResultSet=$(this.jResultSetTemp);
    this.jExcludeSet = this.jExcludeSet.add($(this.jExcludeSetTemp));
}

iQ.prototype.dateFromIso = function(dateString)
{

    isoRegEx = /(\d{4})-?(\d{2})?-?(\d{2})?/g;
    dateArray = isoRegEx.exec(dateString);

    /*
    dr.exec('2012')
        ["2012", "2012", undefined, undefined]
    dr.exec('2012-')
        ["2012-", "2012", undefined, undefined]
    dr.exec('2012-05')
        ["2012-05", "2012", "05", undefined]
    dr.exec('2012-05-')
        ["2012-05-", "2012", "05", undefined]
    dr.exec('2012-05-08')
        ["2012-05-08", "2012", "05", "08"]

    */
    y = parseFloat(dateArray[1]);
    m = parseFloat(dateArray[2])-1;
    d = parseFloat(dateArray[3]);

    //TODO: Support specificity, so if they say >2009, they mean any date in 2010, 2011, etc. (i.e. gte new Date(2010,0,1)) 
    //If they say = 2009, they mean any date in 2009 (i.e. gte new Date(2009,0,1) and lt new Date(2010,0,1))

    y=y?y:0; //
    m=m?m:0; // First month; 0-index
    d=d?d:1; // First of a month
    return new Date(y,m,d);

}
iQ.prototype.date = function(dateQueryString)
{   

    justDateQueryString = dateQueryString.replace(/[<>=]/,'');


    spanRegEx = /P(\d*)Y(\d*)M(\d*)D/;

    this.queryObject = this.dateFromIso(justDateQueryString);
    this.filterFunc = this.dateIs;

    return this.result();


    var pointQueryOptions = 
    {
        '>': this.pointGreaterThan,
        '<': this.pointLessThan
        //,'=': this.pointEqualTo
    }



}

iQ.prototype.point = function(pointQueryString)
{



}


iQ.prototype.getValueList= function()
{

    oResults = this.get();

    this.jResultSet.each(
        )


}

iQ.prototype.values = function()
{

    var values =[],
    numberValues =[];
    values = this.get().toArray().map($.proxy(this.fact.scale, this));



    numberValues = values.filter(function(v,i,a){

        return (!isNaN(v) && v!==undefined && v!==null);
    });

    return numberValues;


}


iQ.prototype.value = iQ.prototype.values;

iQ.prototype.get = function()
{
    return this.jResultSet;

}

iQ.prototype.color = function(color)
{
    this.jResultSet.css('background-color', color);
    return this;
}


iQ.prototype.elementContains = function(element)
{

    return $(element).attr('name').toLowerCase().indexOf(this.queryObject.toLowerCase())>-1;



}

iQ.prototype.elementStartsWith = function(element)
{

    return $(element).attr('name').split(':')[1].toLowerCase().indexOf(this.queryObject.toLowerCase())==0;

}


iQ.prototype.elementEndsWith = function(element)
{

    return $(element).attr('name').split(':')[1].toLowerCase().slice(-this.queryObject.length)==this.queryObject.toLowerCase();

}


iQ.prototype.elementIs = function(element)

{
  
    return $(element).attr('name').split(':')[1].toLowerCase()==this.queryObject.toLowerCase();

}

iQ.prototype.dateIs = function(element)
{

    var cRef = $(element).attr('contextref');
    var context = this.contextRef[cRef];

    var compDate = context.period.instant || context.period.endDate;

    return this.queryObject.getTime() == compDate.getTime();


}

iQ.prototype.prefixIs = function(element)
{

    //All elements should have names
    //All names must be QNames. QNames must have prefixes.
    //But if they do not have prefixes... TODO: Decide how to treat. For now, exclude them.


    return $(element).attr('name').split(':')[0]==this.queryObject;

}

iQ.prototype.element = function (elementQueryString) {

    if(elementQueryString.indexOf(':')>-1)
    {
        elementQueryStringParts = elementQueryString.split(':');
        prefix = elementQueryStringParts[0];
        elementQueryString= elementQueryStringParts[1];
        this.queryObject = prefix;
        this.filterFunc = this.prefixIs
        this.result();
    }

    queryOptions = {
        '*' : this.elementContains,
        '^' : this.elementStartsWith,
        '$' : this.elementEndsWith
    }

    if (elementQueryString=='')
    {
        return this;
    }
    else
    {
        
        var firstChar = elementQueryString.slice(0,1);
        this.filterFunc= queryOptions[firstChar] || this.elementIs;
        this.queryObject = elementQueryString.replace(/[\*\^\$]/g, '');


        
        return this.result();
    }
    
}

iQ.prototype.result = function ()
{

    before = new Date();
    this['result_'+this.operator]();
    after = new Date();
    var effect = {};

    if(this.operator=='and')
    {
        effect = 
        {
            added : 0
        }
    }
    else
    {
        effect = 
        {
            excluded:0
        }
    }


    filterStatsEvent = $.Event('iQ_filterStats',{
            stats:$.extend({
                count:          this.filterStats.find('tr').length,
                operator:       this.operator,
                duration:       (after-before) + 'ms',
                excluded:       this.jExcludeSetTemp.length, 
                added:          this.jResultSetTemp.length,
                nonresults:     this.jExcludeSet.length, 
                results:        this.jResultSet.length,

        }, effect)});

    $('body').trigger(filterStatsEvent);

    this.jResultSetTemp = $();
    this.jExcludeSetTemp = $();

    return this;
}

iQ.string = function()
{


}

/*

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
*/

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
        //Keys:
            //@ entity
                //@identifier   : {string}
                //@ scheme      : {string}
            //@ period      
                //@ startDate   : {date}
                //@ endDate     : {date}
                //@ instant     : {date}
            //@ segment
                //@ axis {string} : member {string} 

        oContext.entity = {};
        //Keyed on ['startDate', 'endDate', 'instant']
        oContext.period = {};
        //Keyed on axis name
        oContext.segment = {};
        oContext.results = []; //In inflate, this happens. Why? Just inject it back into the object.
        oContext.count = 0;
        //oContext.scenario = {};


        sContextId = jContext.attr('id');

        jEntityIdentifier = jContext.find('xbrli\\:entity>xbrli\\:identifier');
        oContext.entity.identifier = jEntityIdentifier.text();
        oContext.entity.scheme =	 jEntityIdentifier.attr('scheme'); 
        
        //===============================Time
        jPeriod = jContext.find('xbrli\\:period');
        lPeriods = ['startDate', 'endDate', 'instant']
        for (i in lPeriods)
        {
            sEl = lPeriods[i];
            jEl = jPeriod.find('xbrli\\:' + sEl);
            oContext.period[sEl] =  jEl.length>0? this.dateFromIso(jEl.text()): undefined; // Using undefined vs '' so I can do an or ('||').
				
        }


        //===============================Other Axes
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


iQ.prototype.click_popoverClose = function (e) {
    e.stopPropagation();
    e.preventDefault();
    jClose= $(e.target);
    jPopover = jClose.closest('.popover');
    jPopover.prev().trigger('click');
}



iQ.prototype.dragstart_sticker= function (e) {
    jSticker = $(e.target);
    jSticker.addClass('being-dragged');
    this.iQconsole.addClass('suggestive');
    e.dataTransfer.setData('iQ', jSticker.attr('data-iq'))
    //e.originalEvent.dataTransfer.effectAllowed='all';
    e.dataTransfer.effectAllowed='all';
}


iQ.prototype.dragend_sticker= function (e) {
    jSticker = $(e.target);
    this.iQconsole.removeClass('suggestive');
    jSticker.removeClass('being-dragged');
}

iQ.prototype.dragover_iQconsole = function(e)
{
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect='copy';
    console.log('draggingOver');
    //e.dataTransfer.dropEffect='copy';
    return false;
}

iQ.prototype.dragenter_iQconsole= function (e) {
    jConsole = $(e.target);
    jConsole.addClass('drag-over');
    e.dataTransfer.dropEffect='copy';
}


iQ.prototype.dragleave_iQconsole= function (e) {
    jConsole = $(e.target);
    jConsole.removeClass('drag-over');
}

iQ.prototype.mouseleave_iQconsole= function (e) {
    jConsole = $(e.target);
    jConsole.removeClass('drag-over');
}




iQ.prototype.drop_iQconsole= function (e) {
    if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting...why???
    iQdata = e.dataTransfer.getData('iQ');

    e.dataTransfer.dropEffect='copy';
    jConsole = $(e.target);
    jConsole.append($('<div></div>').addClass("iq-clause").text(iQdata));
}



iQ.prototype.click_tag = function(e)
{

    jTag = $(e.target);
    if(!jTag.data('popover'))
    {
    jTag.popover(
                {
                    html:true,
                    content:this.tagPopoverHtml(jTag),
                    title:'Tag Info <span class="close">x</span>',
                    placement:'top'
                }
            );

    jTag.popover('show');
    }

    

    jTag.toggleClass('clicked');
    


}


iQ.prototype.tagPopoverHtml = function(jTag)
{

    rowContentFunctions = {
                            'Value' :'valueInfoHtml',
                            'Concept': 'conceptInfoHtml',
                            'Category': 'categoryInfoHtml',
                            'Unit': 'unitInfoHtml',
                            'Date': 'dateInfoHtml'

                        };

    var generateRowContent = function(contentType, index, array)
    {

        return $('<tr></tr>').append(
                        $('<th></th>').text(contentType),
                        $('<td></td>').append(this[rowContentFunctions[contentType]](jTag))
                    );
    };

    return $('<div></div>').append(
                $('<table></table>').append(
                    $('<tbody></tbody>').append(

                                Object.keys(rowContentFunctions).map($.proxy(generateRowContent, this))
                        
                    )
                )
            ).html();
}

/*

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

    */

iQ.prototype.createSticker = function(title, content)
{

    return $('<div></div>')
                //.data('iq-clause', title) // This won't work, maybe because it wasn't injected into the DOM, yet?
                .attr('data-iq', title)
                .addClass('sticker')
                .attr('draggable', 'true').append(
                                $('<span></span>').addClass('expander').text('+'),
                                $('<span></span>').addClass('title').text(title)
                            );


}

iQ.prototype.conceptFilterText = function(concept)
{


}


//
//======================MATH===============================
//



//An alignment function corresponds to each of these
//The alignment tests for equality
iQ.equal = function(a,b, property) { return a.data(property) == b.data(property); };


//Corresponding to the rows in these tables
//http://www.xbrl.org/WGN/XBRL-formula-overview/PWD-2011-12-21/example15va-implicit-filtering-1.png
//Should also correspond with the filtering functions available on an iQ object
iQ.aspects = [ 
    {
        aspect:'element',
        synonyms:['concept', 'tag'],
        aligned: function(a,b) { return iQ.equal(a,b,'name'); }
    },
    {
        aspect:'axes',
        synonyms:['concept'],
        aligned: function(a,b) { return iQ.equal(a,b,'name'); }
    },
]
/*
'period',
'durationLength',
'duration',
'startDate',
'endDate',
'member',
'members',

''
*/


// Returns true if the two iXBRL values are "aligned"
// "Alignment" is like implicit filtering:
// http://www.xbrl.org/WGN/XBRL-formula-overview/PWD-2011-12-21/XBRL-formula-overview-WGN-PWD-2011-12-21.html#section-implicit-filtering
// iQ uses the idea of 'covered' and 'uncovered'
// @method alignment
//
// @param {iQ object}
// @param {iQ object}
// @return {bool} true if the two iXBRL values are "aligned". Uses the first parameter's uncovered aspects
// @static
iQ.alignment = function(a, b)
{

};

// Produces a x b
// @method _cartesianProduct
//
// @param {iQ object} first object, typically the "left operand" in an operation
// @param {iQ object} second object, typically the "right operand"
// @return {multidimensional array} the first dimension represents all the first objects, the second dimension the second objects
// @NOTE: At first it was just going to return a multidimensional array
// But then I get concerned that it's already looping through these dimensions testing for alignment, so it should operate while it's at it?
// @static
iQ._cartesianProduct = function(a, b)
{

    a.get().each(function(firstIndex, firstDOMObject){
        b.get().each(function(secondIndex, secondDOMObject){



        });
    }); //A for loop would also enumerate its builtin properties and methods -- no good


};


iQ._parseValue = function(a)
{

};



iQ._produceValueFunc = function(valueFunc)
{
    return function(a,b,c)
    {

        var newValue = valueFunc(iQ._parseValue(a), iQ._parseValue(b));

        return c
                .text(newValue)
                .data('value', newValue)
                .attr('data-value', newValue);

    };
};


//TODO: Don't just provide an operateFunc, which will produce something
    //And it only gets to act on their values
//Provide a produceFunc, which will act on the whole jQuery objects (or iQ objects?), to produce a new jQuery/iQ object
//Provide a whereFunc, which will test for alignment -- in addition to the implicit filtering.
//For example, to test that the duration begins one day after the startingBalance
//And the end begins one day after the endingBalance

iQ._operate = function(operateFunc)
{
    return iQ._cartesianProduct(a,b,iQ._produceValueFunc(operateFunc));
};


// Produces an iQ object which aligns and sums the params
// @method sum
//
// @param {iQ object} iQ object which is left operand
// @param {iQ object} iQ object which is right operand
// @return {iQ object} iQ object which is summed
// @static

iQ._add = function(a, b)
{
    return iQ._operate(function(a,b){ return a+b; });
};


// Produces an iQ object which aligns the param to the 'this' iQ object
// @method sum
//
// @param {iQ object} iQ object which becomes right operand
// @return {iQ object} iQ object which is summed
iQ.prototype.addTo = function(b)
{
    return iQ._add(this, b);
};


//
//======================UI==================================
//

iQ.prototype.conceptInfoHtml = function(jTag)
{
    sTagName =jTag.attr('name') ||  'No name';
    sAbbrevTagName = sTagName;
    if (sAbbrevTagName.length>35)
    {
        sAbbrevTagName = sTagName.slice(0,35) + "...";
    }  
    return this.createSticker(sAbbrevTagName).attr('title', sTagName).attr('data-iq', sTagName);

}

//Not using iQ.prototype.value because that is an alias for values()
iQ.prototype.fact = {

    transform : function(sValue, sTransformation)
    {
        //TODO: Transform properly

    },

    mapScale : function(i, jTag)
    {
        return this.fact.scale(jTag);
    },

    scale : function(jTag)
    {
        jTag = $(jTag);
        sValue = jTag.text(), 
        sScale = jTag.attr('scale') || '0';

        if (sValue.match(/[A-Za-z]/g))
        {

            //A text block
            //TODO: Check the datatype of the element?
            //Or check if it has a transform attribute?
            return NaN;
        }

        nScaledValue = parseFloat(sValue.replace(/,/g, ''));

        if (isNaN(nScaledValue))
        {

            return NaN;
        }

        nScale = parseInt(sScale);
        
        return nScaledValue * Math.pow(10, nScale);
    }

};

iQ.prototype.valueInfoHtml = function(jTag)
{

    return this.createSticker(this.fact.scale(jTag));
}

iQ.prototype.categoryInfoHtml = function(jTag)
{

    return this.createSticker(jTag.attr('contextref') ||  'No context');

}
iQ.prototype.unitInfoHtml = function(jTag)
{
     return this.createSticker(jTag.attr('unitRef') || 'No unit');
    
}

iQ.prototype.dateInfoHtml = function(jTag)
{

    
     return this.createSticker(jTag.attr('contextRef') || 'No context');
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


//For consistency
//iQ will use this terminology
//In reference to ix:nonFraction where ix is (see map below)

//ix..............................................................................prefix
//nonFraction.....................................................................unqualifiedName or localName or unqualified name http://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-NCName
//ix:nonFraction..................................................................name or qualifiedName or qualified name  * Notice how 'name' refers to qualified name! And notice how qualified  http://www.w3.org/TR/xmlschema-2/#QName
//http://www.xbrl.org/2008/inlineXBRL.............................................namespace
//http://www.xbrl.org/2008/inlineXBRL:nonFraction.................................namespaceQualifiedName or namespace-qualified name....after mappping lexical prefix to value anyUri http://www.w3.org/TR/xmlschema-2/#anyURI
//ix_nonFraction..................................................................underscoreName or underscore-qualified name

//TODO: Reconcile with
//NCName..........http://www.w3.org/TR/xmlschema-2/#NCName
//QName...........http://www.w3.org/TR/xmlschema-2/#QName.........................aligned with qualified name

//http://www.xbrl.org/Specification/inlineXBRL-part1/REC-2010-04-20/inlineXBRL-part1-REC-2010-04-20.html#sec-prefixes
 iQ.nsMap =  {
		'ix'          :		'http://www.xbrl.org/2008/inlineXBRL',
		'ixt'         :	'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20',
		'link'        :	'http://www.xbrl.org/2003/linkbase',
		'xbrli'       :	'http://www.xbrl.org/2003/instance',
		'xl'          :		'http://www.xbrl.org/2003/XLink',
		'xlink'       :	'http://www.w3.org/1999/xlink',
		'xml'         :	'http://www.w3.org/XML/1998/namespace',
		'xsi'         :	'http://www.w3.org/2001/XMLSchema-instance'
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

 iQ.prototype.valueEl = function () {
     var results = [];
     for (i in iQ.el) {
             if (iQ.nonValue.indexOf(iQ.el[i]) == -1) {
                 results.push(iQ.el[i]);
             }
             
        }
     return results;
 }();

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

  	//jPreQualElements.css('background-color', 'yellow');

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




iQ.prototype._processHeader = function()
{
  	
    this.$header = $('ix\\:header');

  	this.$header.find('xbrli\\:context').each(
  		$.proxy(
  		this.getContextRef, this));

  	this.$header.find('xbrli\\:unit').each(
            $.proxy(this.getUnitRef, this));


};

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