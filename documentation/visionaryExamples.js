
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


/*



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
*/

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



	//ELEMENT STRING SYNTAX
	//String syntax, where the user gives string 's' is equivalent to object syntax {name: {contains: {s}}}
	//Contains it the most forgiving operation
	//Because it can be difficult to remember some long/technical element ID's completely.
	//At some point, we want to support more abstract searches, like a search engine (Google)
	//1) Supporting space-delimited keywords
	//2) And searching all labels for matches of these keywords
	//3) And hopefully keeping record of searches and pairing these with the results which satisfied users, to improve a search algorithm.

	iQ().element('Cash')


	//	If the string is comma-separated
	//The comma functions like an .or()
	//To support quick use-cases like this:
	iQ.element('cash, accounts receivable, inventory, prepaid expenses and other current assets').sum().where(iQ.valuesForAllElements)

	//Because of the "or" treatment
	//These are equivalent:
	//EQUIVALENT
	iQ.element('cash, accounts receivable, inventory, prepaid expenses and other current assets')

	iQ.element('cash').or().element('accounts receivable').or().element('inventory') etc...

	iQ({logic:'or'}).element('cash').element('accounts receivable').element('inventory');
	
	//This may be slightly counterintuitive, because in plain English, you might say:
	"The sum of cash AND accounts receivable AND inventory AND prepaid expenses AND other current assets";
	//But this "and" is not the same as a logical "and" in iQ resultSets.
	//It means, the results expected is growing with each new criteria;
	//That is a logical "or" with iQ resultSets.


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
//In fact this is like the xbrli:context elements
//Which have a contextId (in the case of datebook, that is the *key*)
//And they describe instants, or startDate-endDate pairs (in the case of dateBook, these are *values*)

//I expect I will start collecting these artifacts, if users make them on a site that I manage.
//i.e. they can start giving helpful nicknames to Google's important dates
//I'm sure there are algorithms/patterns to these dates, so I can extrapolate ALL Google dates
//For calendar-year companies, that's usually very simple; i.e. a generic dateBook would have Q1 on 1/1-3/31, etc
//But for off-calendar companies (retail), it's nic efor users to supply their stuff to me
//Then there can be a universal dateBook.
iQ({
	'dateBook': 
	{	'spansOfTime':  		//Maybe it's unnecessary to nest durations under spansnOfTime, and instants under pointsInTime, maybe better to just figure it out?
		{	'Q1': iQ.spanOfTime({ start:'2013-01-01', end:'2013-03-31'}), //or iQ.spanOfTime('2013-01-01', '2013-03-31')
			'Q2': iQ.spanOfTime('2013-04-01', '2013-06-30'),
			'Q3_2013': iQ.spanOfTime('2013-07-01', '2013-09-30') //Probably a good idea to specify the year; so this date book can be used for your company in other years
		},
		'pointsInTime'
		{
			'Q1.startDate': '2013-01-01', //This is redundant - the dateBook will automatically create startDate and 
											//endDate points in time for every span of Time object. you create
											//If you create dates with these names, you'll *overwrite* the dateBooks, and cause general ambiguity for any other user who wants to use your dateBook
											//Notice the syntax for these pointsInTime: {spanOfTimeName}.endDate, {spanOfTimeName}.startDate
											//In this case, 'Q1.startDate', the 'Q1' represents the first spanOfTime defined above.

			'FooBarMerger': '2013-05-01', //Remember specific points in time, like when this company merged with FooBar
			'2013_earnings_announcement'	: '2013-06-02'  //As a general convention, use underscores (_) to separate words, orUseCapitalizationLikeThis, but don't use dots (.) -- they're reserved for automatic points in time, like Q1.startDate
		}
	}
	)

//After configuring iQ this way (the global iQ?), 







//SPAN OF TIME SYNTAX
//Spans of time can represent simply some length of time 
		//iQ iwll call this a sliding duration, aka a fluid duration, because it represents a length of time without specifying when that length of time starts or ends in history 
//Example: all datapoints for periods of time equal to 1 quarter, returns Q1, Q2, Q3
//They can also represent lengths of time starting and ending at particular points of time 
			//iQ will call this a fixed duration, aka book-ended duration, aka an anchored duration, because it is book-ended by specific dates (fixed in time) (instead of just some generic duration of time)
//Example: all datapoints for periods of time equal to 1 quarter, starting 1/1, ending 3/31, returns only Q1

//Will iQ support both ideas of duration? (i.e. both a fluid/sliding duration, and a bookended/anchored duration?)
//Or will iQ only support the fluid/sliding duration (Easier to do; simply compare the lengths of duration)
//The most important considerations in making this decision:
//1) Will spanOfTime and pointOfTime be able to work together? i.e. can the user .spanOfTime.and.pointOfTime to achieve the idea of an anchored dictionary, given pointOfTime's treatment for durations (i.e. using the end-date?)
//2) What will the OPERATORS  mean for a spanOfTime? i.e. does 'gt' or 'lt' compare simply the length of the duration, 'gt' finds durations which are longer than the user's input, and 'lt' find durations which are shorter...
//...2) ... Or will 'gt' ALSO try to identify the anchors of the duration; i.e. 'gt' doesn't just require a longer duration, but one whose start date is also *after* (greater than) the user's input?

//Answer:
//iQ (and iQ's spanOfTime object, which is to Javascript what TimeSpan (http://msdn.microsoft.com/en-us/library/system.timespan.aspx) 
	//is to C#) will accommodate BOTH
//ISO8601 format contemplates both ideas of a spanOfTime, aka time interval; (Ctrl+F... B.2.4 here http://dotat.at/tmp/ISO_8601-2004_E.pdf)
//Notice this format: YYYYMMDDThhmm,mZ/YYYYMMDDThhmm,m
	//Since it specifies the "bookend" dates, this is a fixed duration;
	//an iQ span of time object will remember a startDate, and endDate, and can compute the duration (in seconds? minutes? hours? ... something)
//Notice this format: PnnnD
	//Since it only specifies the "length of time" -- the duration; this is a fluid duration
	//an iQ span of time object will convert the string to an integer duration value (Seconds? minutes? hours? object of all of these? Javascript uses miliseconds), but will not know a startDate and endDate
oneYear= new Date('2013')-new Date('2012');
console.log(oneYear);//31622400000
console.log(oneYear/1000/60/60/24); //Conver to seconds, then minutes, then hours, then days... outputs 366.




//SPAN OF TIME SYNTAX
//Create a fixed duration
//STRING SYNTAX / DATE SYNTAX
//Two parameters...
// which are simply passed to a new Date() constructor, which will make whatever assumptions it does in your Javascript implementation
	iQ.spanOfTime('2013', '2012') 
	//Or two dates
	iQ.spanOfTime(new Date('2013'), new Date('2012'))
	//Or two points of time;  t his is just an alias for a new Date constructor
	iQ.spanOfTime(iQ.pointInTime('2013'), iQ.pointInTime('2012'))
//NOTE: The above objects will be able to derive the length of time:
Q3 =  iQ.spanOfTime('2012', '2013');
console.log(Q3.duration);
//This will output the equivalent of 1Y, the difference between 2012 and 2013; 
//Equivalent to: 
//new Date('2013')-new Date('2012')
//31622400000

//One parameter... string... considered the length of time if it matches ISO 8601 format
iQ.spanOfTime('P5Y2M3D'); //This syntax may be wrong, but it's the general idea
//Note, the above will not have any startDate or endDate, they will be explicitly set to null

//OBJECT SYNTAX
//One parameter can specify any of the three core attributes, startDate, endDate, duration
//duration can be a string or a length, in MS
//It doesn't make sense to specify only one parameter, unless that parameter is duration. i.e. startDate on its own, is useless, ditto endDAte
//Therefore, if only duration is specified, spanOfTime will become a fluid duration
//It doesn't make sense to specify three parameters (startDate and endDate) AND a duration -- that's redundant.
//Therefore, given any two of three parameters, a spanOfTime will calculate the third, and will become a complete fixed duration

iQ.spanOfTime({startDate: '2012', endDate: '2013'}) //Creates a fixed duration
		//Equivalent to:
		iQ.spanOfTime({startDate: '2012', duration:31622400000}) 
		//Or:
		iQ.spanOfTime({endDate: '2013', duration:31622400000}) 
		//And equivalent to more compact STRING SYNTAX:
		iQ.spanOfTime('2012', '2013'})

iQ.spanOfTime({duration:31622400000}) //Creates a fluid duration, since no startDate or endDate is specified

		//equivalen to more compact DOUBLE SYNTAX:
		iQ.spanOfTime(31622400000)
		//or STRING SYTNAX:
		iQ.spanOfTime('1Y')

iQ.spanOfTime({startDate: '2012'}) // Not enough information

iQ.spanOfTime({startDate: '2012', endDate: '2013', duration:31622400000}) //Redundant. spanOfTime will always calculate its own duration if given a startDate and endDate; 
//NOTE: the spanOfTime calculated duration that will overwrite the user-provided duration.

//Now you know the syntax, and you know how to create a fluid duration, and a fixed duration
//The OPERATORS of spanOfTime queries / filters will work differently depending on whether they are passed a fluid or fixed duration
//If given a fluid duration, 'gt' simply means, return XBRL values whose duration represents a longer amount of time, regardless of when that duration started and ended
//If given a fixed duration, 'gt' means the same as fluid duration, AND further filters the results to only include those whose XBRL startDate is ALSO greater than the start Date (this logically means the same for the endDate, since the duration is gt)
	//I expect that the fluid duration queries/filters will be more useful; i.e. find all values for the length of a quarter, (greater than 80 days and less than 100 days.) regardless of when they start, 
	//But fixed duration queries/filters could also be useful; i.e. find all values for the length of a quarter, and they must start after the start date of Q2.


//SPANOFTIME INTERNAL LOGIC
//Like POINTINTIME INTERNAL LOGIC, this uses and
//To enable range filters, gt && lt
//But be careful of ..
//NONSENSE FLUID
//Fluid durations will make either nonsense/no-overlap queries
//Or nonsense/everything queries
//Depending on internal logic, which is implicitly AND

//No span of time is greater than 5 days AND less than 3 days
iQ().spanOfTime({
	gt: '5D',
	lt:'3D'
	//implicit logic:'and'
})

//All spans of time are either greater than 4 days OR  less than 5 days 
iQ().spanOfTime({
	gt: '4D',
	lt:'5D',
	logic:'or'
})

//SAMPLE QUERY: Find all values for a quarter, which is crudely estimated at 90 days, plus or minus 10 days
iQ().spanOfTime({
	gt: iQ.spanOfTime({duration:'80D'}),
	lt: iQ.spanOfTime({duration:'100D'})
})


//ADVANCED FIXED
//Remember the logic for gt when gt is given a fixed duration, it tests the length of the duration and  the start date of the duration
//Our dateBook has Q1.startDate = 1/1/2013
//So this returns all quarters that start after Q1 (Q2, Q3, Q4)
iQ().spanOfTime({
	gt: iQ.spanOfTime({duration:'80D', startDate:'Q1.startDate'}),
	lt: iQ.spanOfTime({duration:'100D'})
})

//If not careful.... it's easy to...
//NONSENSE FIXED
//Because fixed durations bring pointsInTime back into the equation; i.e. the bookend dates
//It's possible to make nonsense queries owing to the bookend dates
iQ().spanOfTime({
	gt: iQ.spanOfTime({duration:'80D', startDate:'Q1.endDate'}),
	lt: iQ.spanOfTime({duration:'100D', startDate:'Q1.startDate'})
})

//An implicit AND
//While it's possible to be goth gt 80D and lt 100D
//It's not possible for the startDate to be gt Q1.endDate (3/31/2013)
//And for the startDate to be lt the Q1.startDate (1/1/2013)




//HOW DOES SPANOFTIME HANDLE INSTANT VALUES
//Unless spanOfTime filter specifies only:true
//Then the filter will return the instant XBRL value 
//Let's suppose there are Assets as of 12/31/2013


iQ.spanOfTime({'gt': '3M'}) 				//This is not 	using ISO 8601 format; 


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
['element', 'concept', 'account', 'lineItem', 'tag'],
['eq', 'equalTo'],
['lt', 'lessThan'],
['gt', 'greaterThan'],
['tspan', 'spanOfTime', 'duration', 'of'],
['tpoint', 'pointInTime', 'instant', 'at'],
['def', 'definition', 'doc', 'documentation'],
['dim', 'member', 'subcategory'],
['plus', 'addTo'],

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


//MATH
//

iQ.element('us-gaap:Liabilities').called('liabilities')
.plus()						//Should plus have params? Maybe this should contain. Use synonyms
.element('us-gaap:Equity').called('equity')
.where(iQ.samePointInTime) //The zipper; executs the math and produces new result set, so it's an endcap
.called('LiabilitiesAndEquity') // Should we namespace it for them, or LC3 it for them, or underscore it for them? -- Called could also be a nice endcap
.with() 
.must()
.equal()

iQ.element('us-gaap:Liabilities')
.plus(						
	iQ.element('us-gaap:Equity')
	)
.where(iQ.samePointInTime) 
.called('LiabilitiesAndEquity') 
.with() 
.must()
.equal()


//www.xbrl.org/WGN/XBRL-formula-overview/PWD-2011-12-21/XBRL-formula-overview-WGN-PWD-2011-12-21.html#section-value-assertion-example19

iQ.element('concept:NetIncomes') // Filters to two values
.called('netIncome') // Optional

.must(iQ.beGreaterThan) 	//
.must().beGreaterThan()		//


iQ.must()

iQ
.add(
	iQ.element('concept:CurrentAssets'),
	iQ.element('concept:NonCurrentAssets')
	)
.where(
	iQ.cEqual, 
	iQ.uEqual
	) //Comparator functions which take two operands
.becomes(iQ.named('concept:TotalAssets'), iQ.span // At this point they forget their operands

			)
	.called('derived:TotalAssets')
	
	

iQ.subtract()



