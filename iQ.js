
if (!iQ)
{
var iQ = {};
console.log('Created global iQ object')

	iQ = function(oOptions){

	this.setOptions(oOptions);
	this.bindEvents();
	//this.initiXbrl();
	this.initThis();
	this.addResourceTable();
this.alliX();
	}
}

iQ.prototype.setOptions = function(oOptions)
{


//TODO: Do we need to rely on jQuery?
this.o = $.extend(
				{
					url:'http://www.xbrl.org/inlinexbrlextractortutorial/MassiveDynamic.html',
					inflate:true,
					loadDts:false,
					types: [], //Means to use iQ.el
					sortBy: 'dom',
					strict: false,
					target: 'body'
				}, 
				oOptions);

}

iQ.prototype.bindEvents = function()
{



}

iQ.prototype.initThis = function()
{
this.processHeader();

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
,'tuple'];

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
  	u = iQ.el.slice(0);
  	q=[];
  	for (i in u)
		{
			q.push('ix\\:' + u[i]);
		}
  	return q;
  }();


  iQ.prototype.alliX = function()
  {
  	lPreQualElements = this.iX.slice(0);
  	sPreQualElements = lPreQualElements.join(',');
  	jPreQualElements = $(sPreQualElements);
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
  	


		this.contextRef = {};

  	$('ix\\:header').find('xbrli\\:context').each(
  		$.proxy(
  		function(index, domContext){
  				jContext = $(domContext);

  				oContext = {};
  				oContext.entity = {};
  				oContext.period = {};
  				oContext.segment= {};
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


  		}, this));





};

$(document).ready(function(){




	q = new iQ();
})