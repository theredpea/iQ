function ($) 
{
	$.fn.iQ = function() {

	}


}(jQuery);


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
 iQ.el = [
'denominator'
,'exclude'
,'footnote'
,'fraction'
,'header'
,'hidden'
,'nonFraction'
,'nonNumeric'
,'numerator'
,'references'
,'resources'
,'tuple'
];

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
	'unitRef',
];



  iQ.iX = function(){
  	u = iQ.el;
  	q=[];
  	for (e in u)
		{
			q.push('ix\\:' + e);
		}
  	return q;
  }();