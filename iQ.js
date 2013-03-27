
iQ = function(oOptions){

    this.setOptions(oOptions);
    this.processHeader();
    this.getElements();
    this.console.makeConsole();
	//this.initiXbrl();

	//this.addResourceTable();
    this.alliX();
    this.bindEvents();

	}



iQ.prototype.bindEvents = function()
{

    $('body').on('click', '[name]', $.proxy(this.click_tag, this));
    //TODO: Must load all synonyms here and point them at the proper functions!
    this.body = $('body');
    this.body.on('click', '.popover .close', $.proxy(this.click_popoverClose, this));
    this.iQconsole = $('#iQconsole');

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
    this.history={};
//Represents inter logic, not intra logic
	this.logic = 'and';

    
        this.jResultSet.each(
            $.proxy(this.getResults, this));
    
}

iQ.prototype.inflate = function(oResult, jResult, options)
{

    options = $.extend({bPopover:true}, options);
    if (jResult===undefined)
    { return undefined;
    }

    inflateFunc = function(propName, propValue){
        jResult.data(propName, propValue);
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
    //And cram the whole object there for reference.
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

        if (lElementProperties.indexOf('any') > -1) {

            anyStringFilter = lElementProperties.any;
		//For example, 
/*

                    {
                        contains: oElement,
                        caseSensitive: false,
                        sortBy:'name'   //TODO: Figure out how a sortObject works, and what is its default? Its parent key ascending?
                    }
*/

            elementProperties = Object.keys(this._elementFilterDoc())
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


            allStringFilter = lElementProperties.all;

            elementProperties = Object.keys(this._elementFilterDoc())
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

	throw 'List options is empty';
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
            throw 'After striping whitespace, iQ cannot find any strings. Empty filter?';
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
		filters = oElement;
	}
        

        var jFilterResultSet, jEachResultSet;



        iQinstruction = this.history[startTime].iQinstruction = listOptions.map($.proxy(function (value) {
            
        }, this));
	

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
        console.log('regex');
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


iQ.element = function () {
}

iQ.string = function()
{


    }

iQ.prototype.result_and = function(eachFunc, eachOperand)
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

iQ.prototype.value = {

    scaleValue : function(sValue, sScale)
    {


        nScaledValue = parseFloat(sValue.replace(/,/g, ''));

        if (isNaN(nScaledValue))
        {

            return sValue;
        }

        nScale = parseInt(sScale);
        
        return nScaledValue * Math.pow(10, nScale);
    }

};

iQ.prototype.valueInfoHtml = function(jTag)
{

    return this.createSticker(this.value.scaleValue(jTag.text(), jTag.attr('scale') || '0'));
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



  iQ.prototype.processHeader = function()
  {
  	



  	$('ix\\:header').find('xbrli\\:context').each(
  		$.proxy(
  		this.getContextRef, this));

  	$('ix\\:header').find('xbrli\\:unit').each(
$.proxy(this.getUnitRef, this));





};

iQ.prototype.console = {

    makeConsole: function()
    {

        $('<div></div>').attr('id', 'iQconsole').appendTo('html');
    }
}

  $(document).ready(function(){




      q = new iQ();
  });