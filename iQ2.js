
iQ = function(oOptions){

    this.index();
}


 iQ.elements = ['nonFraction'
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

iQ.prefixIt = function(prefix, escaped){
    if (escaped===undefined) escaped=true;
    var joiner = escaped ? '\\:' : ':';
    return function(element, index, array) {
        return prefix+joiner+element;
    };
};

 iQ.nvElements = [
     'header',
     'exclude',
     'references',
     'resources',
     'hidden',
     'footnote'
 ];


 iQ.prototype.index = function () {


        var allElements = document.querySelectorAll(iQ.elements.map(iQ.prefixIt('ix')),
            length = allElements.length;

        for ()
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