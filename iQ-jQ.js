// iQ as jQuery plugin...

function ($) 
{
	$.fn.iQ = function() {

	}


}(jQuery);

//BASIC QUERY
//Illustrates interstitial logic
$('#iXBRL').iQ()
		.element(
			{name:
				{contains:"Cash"}
			})
		.and()
		.pointInTime(
			{gt: "2011/01/2012"
			});


//Implicit interstitial logic is AND, by default
//I assume most people want to successively filter
//These are EQUIVALENT
$('#iXBRL').iQ()
		.element('Cash')
		.pointInTime('2011/01/2012');

$('#iXBRL').iQ()
		.element('Cash')
		.and()
		.pointInTime('2011/01/2012');



//CONFLICTING QUERIES, NONSENSE QUERIES, SETS DO NOT OVERLAP
//Will return no results

$('#iXBRL').iQ()
		.pointInTime(
			{gt:"2013"
			})
		.and()
		.pointInTime(
			{lt: "2012"
			});


//ELEMENT SYNTAX

	//NAMESPACES
	//When referring to the element name, I mean the prefix-qualified element name, colon-delimited (not underscore delimited)
	//What else is there?
	//Let's talk about the element us-gaap:Cash...
		//It is definitely NOT named "CashMoney" or "Argent"
		//It's fair to say it IS named...
			//"Cash" 									// 	iQ calls this the unqualified name
			//"us-gaap:Cash" 							// 	iQ calls this the prefix-qualified name
			//"http://{us-gaap-namespace-url}:Cash" 	//	iQ calls this the url-qualified name, or the namespace-qualified name
		//iQ encourages the second approach, the prefix-qualified element name
			//As of this writing, prefix-qualified is the most common practice to refer to elements (though iQ prefers colons to underscores)
			//prefix-qualified strikes a balance between being terse, but qualifying elements to prevent confusion (see: collision)
			//And the most important reason: 
				//While the spec says the name is specified in the name attribute, which must be the QName type http://www.w3.org/TR/xmlschema-2/#QName
				//The spec examples all use prefixes http://www.xbrl.org/Specification/inlineXBRL-part1/CR-2009-11-16/inlineXBRL-part1-CR-2009-11-16.html#d1e6297
				//I'm confused here, the value-space of QNames must have URI's, but the lexical space allows anything that maps to the value-space
	//If none of this makes sense, check out the difference between prefixes and namespaces in this iXBRL table http://www.xbrl.org/Specification/inlineXBRL-part1/CR-2009-11-16/inlineXBRL-part1-CR-2009-11-16.html#sec-prefixes
		//And read more about why namespaces are used, here {}
		//If you don't care, skip to "Element String Syntax"
	//iQ does not require that namespace "maps" exist to go from lexical to value (i.e. to go from prefix to namespace URI)
	//In other words, it will help you find the element with the prefix-qualified name "taxes:MortgageInterestDeduction", even if the iXBRL document doesn't describe what "taxes" represents! (indeed it's ambiguous! Is it some IRS taxonomy? Who defines this element?!)
	//....Unless it is in strict mode
	iQ({'strict':true})


	//OBJECT SYNTAX
	//Currently, we can only search on the element name
	//We hope to support other element string attributes, i.e. their many different labels
	//But that requires parsing linkbases, we'll do it later.
	iQ().element(
		{'name': {StringQuery}});



	//STRING SYNTAX
	//String syntax, where the user gives string 's' is equivalent to object syntax {name: {contains: {s}}}
	//Contains it the most forgiving operation
	//Because it can be difficult to remember some long/technical element ID's completely.
	//At some point, we want to support more abstract searches, like a search engine (Google)
	//1) Supporting space-delimited keywords
	//2) And searching all labels for matches of these keywords
	//3) And hopefully keeping record of searches and pairing these with the results which satisfied users, to improve a search algorithm.

	iQ().element('Cash')



//STRING QUERIES

//EQUIVALENT
$('#iXBRL').iQ()
		.element(
			{name:
				{contains:"Assets"}
			})
		.or()
		.element(
			{name:
				{contains:"Liabilities"}
			});


//REGEX SYNTAX
//The same as...
$('#iXBRL').iQ()
		.element(
			{name:
				{matches:/Assets|Liabilities/g}
			});



//EQUIVALENT
$('#iXBRL').iQ()
		.element(
			{name:
				{is:"us-gaap:Assets"}
			})
		.or()
		.element(
			{name:
				{is:"us-gaap:Liabilities"}
			});

$('#iXBRL').iQ()
		.element(
			{name:
				{is:"us-gaap:Assets us-gaap:Liabilities"}
			})


//QUERIES ON OTHER ELEMENT INFORMATION
//Illustrates internal logic
//When a method can search on multiple ATTRIBUTES (like an element's name, definition, and (... more to come))
//Or when a method can apply multiple OPERATORS (like eq, gt, lt)
//Unless otherwise specified, it will use OR LOGIC
	//This can be changed (but this is not supported/recommended?) by using the logic attribute, 
	//which can take values 'and' or 'or' -- case insensitive

//DEFAULT value for element is OR, because I think people will do that more commonly;
//i.e. they want to quickly search all element labels
//EQUIVALENT
$('#iXBRL').iQ()
		.element(
			{name:
				{contains:"Assets"}
			})
		.or()
		.element(
			{def:
				{contains:"Assets"}
			});


$('#iXBRL').iQ()
		.element(
			{	name:
				{contains:"Assets"},
		
				def:
				{contains:"Assets"}
			});


//DEFAULT value for spanOfTime is AND, because I think people will do that more commonly.
//i.e. they want to capture all instant values within a range
//If I used internal OR, this spanOfTime filter would be useless; greater than 2013/03/31, OR less than 2013/06/30... is effectively all dates.
$('#iXBRL').iQ()
		.spanOfTime(
			{gt:'2013/03/31'
				lt:'2013/06/30');


$('#iXBRL').iQ()
		.element(
			{	name:
				{contains:"Assets"},
		
				def:
				{contains:"Assets"}
			});




//SEARCHING 
//Element aspect ANY
//If the word "Assets" was found in any of the element atributes (name, any of the labels (including documentation))

$('#iXBRL').iQ()
		.element(
			{	any:
				{contains:"Assets"}			
			});

//SEARCHING 
//Element aspect ALL
//If the word "Assets" was found in all of the element atributes (name, all of the labels (including documentation))

$('#iXBRL').iQ()
		.element(
			{	all:
				{contains:"Assets"}			
			});




//QUERIES ON DATES
//ONLY Keyword
//Using only property on pointInTime method or spanOfTime method will exclude all results which are not instant elements (if pointInTime is used) or duration elements (if spanOftime is used)
//Only instant values
iQ()
	.pointInTime(
		{only: true}
		);

//Only duration values
iQ()
	.spanOfTime(
		{only: true}
		);


//POINT IN TIME SYNTAX
//After 2013-03-31
//Can pass a string; iQ will simply instantiate a date with it
//Can pass a Date object
//Or can use the iQ.pointInTime method which, at this point, is just an alias for a date (But may be enhanced in the future to accommodate more syntax)
//EQUIVALENT
iQ()
	.pointInTime(
		{'gt': '2013-03-31'}
		);

iQ()
	.pointInTime(
		{'gt': new Date('2013-03-31')}
		)

iQ()
	.pointInTime(
		{'gt': iQ.pointInTime('2013-03-31')}
		)

	//HOW DOES POINT OF TIME HANDLE DURATION ELEMENTS
	//For example, IXDS contains Revenue, for Q2 as defined in  dateBook 'Q2': iQ.spanOfTime('2013-04-01', '2013-06-30'),
	//pointInTime queries which do NOT specify 'only' apply their search to the END DATE of any values which use DURATION elements
	iQ()
		.pointInTime({'gt':'2013-07-01'})  			// Since the Revenue ENDS on 2013-06-30, will not find it
		.pointInTime({'gt':'Q2.endDate'})  			// Since the Revenue ENDS on 2013-06-30, and Q2 also does, will not find it
		.pointInTime({'gt':'2013-06-30'})  			// will not find it

//POINT IN TIME GT
//There is no explicit greaterThanOrEqual (gte)
//1) Because gte:2013-03-05 is more-or-less equivalent to gt:2013-03-04. Therefore users can  adjust their queries to use gt, and achieve the same. If you disagree, let me know your use case.
//2) Even if we want to support gte use cases, I hope to do so using the implicit internal OR operator and this syntax:

iQ()
.pointInTime({
	'gt': '2013-03-05',
	'eq': '2013-03-04'
})


//DATEBOOK 
//To give pointInTime and spanOfTime nicknames
//So they are easier to remember and repeat
iQ({
	'dateBook': 
	{	'spansOfTime':
		{	'Q1': iQ.spanOfTime({ start:'2013-01-01', end:'2013-03-31'}), //or iQ.spanOfTime('2013-01-01', '2013-03-31')
			'Q2': iQ.spanOfTime('2013-04-01', '2013-06-30'),
			'Q3_2013': iQ.spanOfTime('2013-07-01', '2013-09-30') //Probably a good idea to specify the year; so this date book can be used for your company in other years
		},
		'pointsInTime'

			'Q1.startDate': '2013-01-01', //This is redundant - the dateBook will automatically create startDate and 
											//endDate points in time for every span of Time object. 
											//If you create dates with these names, you'll overwrite the dateBooks.
											//Notice the syntax for these pointsInTime: {Q1}.endDate, {Q1}.startDate

			'FooBarMerger': '2013-05-01', //Remember specific points in time
			'2013_earnings'	'2013-06-02'  //As a general convention, use underscores (_) to separate words, orUseCapitalizationLikeThis, but don't use dots (.) -- they're reserved for automatic points in time, like Q1.startDate
		}
	}
	)

//After configuring iQ this way (the global iQ?), 







//SPAN OF TIME SYNTAX
//Spans of time can represent simply some length of time
//Example: all datapoints for periods of time equal to 1 quarter, returns Q1, Q2, Q3
//They can also represent lengths of time starting and ending at particular points of time
//Example: all datapoints for periods of time equal to 1 quarter, starting 1/1, ending 3/31, returns only Q1


iQ
	.spanOfTime({'gt': '3M'}) 					//Use ISO 8601 format; (Ctrl+F... B.2.4 here http://dotat.at/tmp/ISO_8601-2004_E.pdf)




//SYNONYMS
//Many functions are aliased
//This accommodates different words for the same thing
//For example, you can use 'eq' or you can use 'equalTo'
//The former is more compact, but the latter is more readable
//Goal:
	//Technical: Accommodate synonyms (without encouraging them)
	//Non-Technical: Allow users to chose what makes the most sense; always including a "plain English" synonym 
//The first one in each list is the ultimate key for functions of properties within iQ
//Arrange this properly
iQ.synoyms={
['element', 'concept', 'account'],
['eq', 'equalTo'],
['lt', 'lessThan'],
['gt', 'greaterThan'],
['tspan', 'spanOfTime', 'duration', 'in'],
['tpoint', 'pointInTime', 'instant', 'at'],
['def', 'definition', 'doc', 'documentation'],
['dim', 'member', 'subcategory'],
};

iQ.synonymsDict = (function(){

	var synonymsDict = {};
	for (synList in iQ.synonyms)
	{
		//The first one in each list is the ultimate key for functions of properties within iQ
		synonymsDict.defaults.push(synList[0]);
		for (syn in synList)
		{

			//Making a copy
			syns = synList.slice(0);
			//Removing the syn which will become the key
			syns.splice(synList.indexOf(syn), 1);
			//Key is one of the synonyms, value is a list of its synonyms
			synonymsDict[syn]= syns;

		}
	}

	return synonymsDict;

})();
