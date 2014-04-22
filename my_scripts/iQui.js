//This is all in console
iQ.ui = function(oOptions){

    this.setOptions(oOptions);
    this.getElements();
    
    this.makeConsole(); // was this.console.makeConsole();
    this.makeFilterStats();
	//this.initiXbrl();

	//this.addResourceTable();
    this.alliX();
    this.bindEvents();

	}


iQ.ui.prototype.showFilterStats = function(e)
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

iQ.ui.prototype.bindEvents = function()
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
    //this.body.on('iQ.ui_filterStats',  $.proxy(this.showFilterStats, this));
    //this.body.on('click', '.popover .close', $.proxy(this.click_popoverClose, this));

    this.body[0].addEventListener('drop', function(e){alert('dropped');});

    ['dragstart', 'dragend'].forEach($.proxy(function(e, index, array){

        //TODO: These events will fire any time anything is dragged, not just stickers, because I removed jQuery's context. However, only stickers are draggable=true

        this.body[0].addEventListener(e, $.proxy(this[e+'_sticker'], this));

    }, this));


    ['dragenter', 'dragleave', 'dragover', 'drop', 'mouseleave'].forEach($.proxy(function(e, index, array){

        this.iQ.uiconsole[0].addEventListener(e, $.proxy(this[e+'_iQ.uiconsole'], this));
    }, this));

    this.iQ.uiconsole.on('mouseleave', $.proxy(this.mouseleave_iQ.uiconsole, this));

}




iQ.ui.prototype._measureIt = function(func, callIt, howOften, timeResults)
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

iQ.ui.prototype._inflate = function(oResult, jResult, options)
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


iQ.ui.prototype.click_popoverClose = function (e) {
    e.stopPropagation();
    e.preventDefault();
    jClose= $(e.target);
    jPopover = jClose.closest('.popover');
    jPopover.prev().trigger('click');
}



iQ.ui.prototype.dragstart_sticker= function (e) {
    jSticker = $(e.target);
    jSticker.addClass('being-dragged');
    this.iQ.uiconsole.addClass('suggestive');
    e.dataTransfer.setData('iQ.ui', jSticker.attr('data-iQ.ui'))
    //e.originalEvent.dataTransfer.effectAllowed='all';
    e.dataTransfer.effectAllowed='all';
}


iQ.ui.prototype.dragend_sticker= function (e) {
    jSticker = $(e.target);
    this.iQ.uiconsole.removeClass('suggestive');
    jSticker.removeClass('being-dragged');
}

iQ.ui.prototype.dragover_iQ.uiconsole = function(e)
{
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect='copy';
    console.log('draggingOver');
    //e.dataTransfer.dropEffect='copy';
    return false;
}

iQ.ui.prototype.dragenter_iQ.uiconsole= function (e) {
    jConsole = $(e.target);
    jConsole.addClass('drag-over');
    e.dataTransfer.dropEffect='copy';
}


iQ.ui.prototype.dragleave_iQ.uiconsole= function (e) {
    jConsole = $(e.target);
    jConsole.removeClass('drag-over');
}

iQ.ui.prototype.mouseleave_iQ.uiconsole= function (e) {
    jConsole = $(e.target);
    jConsole.removeClass('drag-over');
}




iQ.ui.prototype.drop_iQ.uiconsole= function (e) {
    if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting...why???
    iQ.uidata = e.dataTransfer.getData('iQ.ui');

    e.dataTransfer.dropEffect='copy';
    jConsole = $(e.target);
    jConsole.append($('<div></div>').addClass("iQ.ui-clause").text(iQ.uidata));
}



iQ.ui.prototype.click_tag = function(e)
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


iQ.ui.prototype.tagPopoverHtml = function(jTag)
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

iQ.ui.prototype.createSticker = function(title, content)
{

    return $('<div></div>')
                //.data('iQ.ui-clause', title) // This won't work, maybe because it wasn't injected into the DOM, yet?
                .attr('data-iQ.ui', title)
                .addClass('sticker')
                .attr('draggable', 'true').append(
                                $('<span></span>').addClass('expander').text('+'),
                                $('<span></span>').addClass('title').text(title)
                            );


}

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



iQ.ui._parseValue = function(a)
{

};



//
//======================UI==================================
//

iQ.ui.prototype.conceptInfoHtml = function(jTag)
{
    sTagName =jTag.attr('name') ||  'No name';
    sAbbrevTagName = sTagName;
    if (sAbbrevTagName.length>35)
    {
        sAbbrevTagName = sTagName.slice(0,35) + "...";
    }  
    return this.createSticker(sAbbrevTagName).attr('title', sTagName).attr('data-iQ.ui', sTagName);

}

//Not using iQ.ui.prototype.value because that is an alias for values()

iQ.ui.prototype.valueInfoHtml = function(jTag)
{

    return this.createSticker(this.fact.scale(jTag));
}

iQ.ui.prototype.categoryInfoHtml = function(jTag)
{

    return this.createSticker(jTag.attr('contextref') ||  'No context');

}
iQ.ui.prototype.unitInfoHtml = function(jTag)
{
     return this.createSticker(jTag.attr('unitRef') || 'No unit');
    
}

iQ.ui.prototype.dateInfoHtml = function(jTag)
{

    
     return this.createSticker(jTag.attr('contextRef') || 'No context');
}


iQ.ui.prototype.initiXbrl = function()
{
/*
	$.ajax({
		type: 'GET'
		url: this.o.url,

	});
*/

//http://www.xbrl.org/Specification/inlineXBRL-part1/REC-2010-04-20/inlineXBRL-part1-REC-2010-04-20.html#sec-prefixes
 iQ.ui.nsMap =  {
		'ix'          :		'http://www.xbrl.org/2008/inlineXBRL',
		'ixt'         :	'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20',
		'link'        :	'http://www.xbrl.org/2003/linkbase',
		'xbrli'       :	'http://www.xbrl.org/2003/instance',
		'xl'          :		'http://www.xbrl.org/2003/XLink',
		'xlink'       :	'http://www.w3.org/1999/xlink',
		'xml'         :	'http://www.w3.org/XML/1998/namespace',
		'xsi'         :	'http://www.w3.org/2001/XMLSchema-instance'
 };



iQ.ui.prototype.addResourceTable= function () {

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




iQ.ui.prototype.average = function()
{
    var sum=0;
    var count =0;
    this.values().forEach(function(v,i,a){
        sum+=v;
        count++;
    })
    return sum/count;
}

iQ.ui.prototype.makeFilterStats = function(){

    if (!this.filterStats)
    {
        this.filterStats = $('#filterStats');

    }

    if(this.filterStats.length==0)
    {
        this.filterStats = $('<div></div>').attr('id', 'filterStats').append($('<table></table>').prepend($('<thead></thead>'), $('<tbody></tbody>'))).appendTo('html');
    }
}

iQ.ui.prototype.makeConsole = function(){
    /*
    makeConsole: function()
    {
    */

            if (!this.iQ.uiconsole)
            {
                this.iQ.uiconsole = $('#iQ.uiconsole');

            }

            if ($('#iQ.uiconsole').length==0)
            {

                this.body.on('iQ.ui_filterStats',  $.proxy(this.showFilterStats, this));
                this.iQ.uiconsole = $('<div></div>').attr('id', 'iQ.uiconsole').appendTo('html');
            }

    /*
    }
    */
}

  $(document).ready(function(){




      q = new iQ.ui();
  });