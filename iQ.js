//This is all in console
iQ = function(oOptions){

    this.setOptions(oOptions);
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




iQ.prototype._measureIt = function(func, callIt, howOften, timeResults)
{
    timeResults = timeResults || [];
    howOften = howOften || 1;
    for(i=0;i<howOften; i++)
    {
        var startDate = new Date();
        func();
        var endDate = new Date();
        var timing = (endDate-startDate);

        timeResults.push(timing);
        console.log( callIt + ' took ' + timing + ' ms;');
    }
    console.log(callIt+  ' averaged ' + this._averageIt(timeResults));

};

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