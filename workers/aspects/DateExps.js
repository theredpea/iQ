DateExps={};
	// [21] z or Z for UTC or [22] +/-, [23]Hours offset, An optional colon, [24] Minutes Offset


//The smallest value used can have a fractional part 
DateExps.ISO_8601_DURATION		= new RegExp('(P(\d*\.\d*)*Y*(\d*\.\d*)*M*(\d*\.\d*)*D*)(T(\d*\.\d*)*H*(\d*\.\d*)*M*(\d*\.\d*)*S*)*');

DateExps.DURATION_PARTS  = [
				//{name:'datePart', 		matchIndex:1},
				{name:'yearPart', 		matchIndex:2},
				{name:'monthPart', 		matchIndex:3},
				{name:'dayPart', 		matchIndex:4},
				//{name:'timePart', 		matchIndex:5},
				{name:'hourPart', 		matchIndex:6},
				{name:'minutePart', 	matchIndex:7},
				{name:'secondPart', 	matchIndex:8}];
				

DateExps.Clone = function (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}





DateExps.DePartName = function (e) {
	name = e.name ? e.name : (e ? e : '');

	return name.replace('Part','');
}



/*
//Encompasses the two concepts PointExp and DurExp
//Overkill? 

InterExp = function(){}
InterExp.prototype = RangeExp.prototype;
*/

//Encompasses all three, PointExp, DurExp, InterExp


DateExps.DOCUMENTATION = [

];
	//Check ContextRef
		//Comma separated means or? Too complicated...
		//Modifier
			//f
				//Fuzzy
				//Without Fuzzy, finds only those other elements with the same ContextRef
				//With Fuzzy, finds those other elements with a Date Component which
					//Matches the contextRef provided

	//Check DateBook
		//If options.DateBook provided
			//i.e. Alias for repeated queries
				//{ Q1_2013: '20130101->20130331'

	//DateExp
		//Instant
				//'2013'
			//Range of instants
				//'2013-2015'
			//" 		", left-inclusive
				//'2013=-2015'
			//" 		", right-inclusive
				//'2013-=2015'
			//"			", both-inclusive
				//'2013=2015'
		//Duration
			//Duration, ISO Syntax;
				//Not recommended
				//http://en.wikipedia.org/wiki/ISO_8601#Durations
				//NOTE: Only does a Length Match
				//Converts to miliseconds
				//i.e. One year:
				//'P1Y0M0DT00H00M0S'
				//ISO Syntax Range;

			//Duration, Start and End Syntax
				//2013-2015
			//Length Match
				//'(2013->2015)'
			//Full Match
				//'2013->2015'
			//Full Match, Range
				//'2013-2014->2015-2016'
			//'{isoDate}->{isoDate}'
	//Modifiers
		//i
			//Instant/Duration insensitive; Instant searcehs apply to Duration
			//Default, use the end date of the Duration
				//i.e. a Duration {start:20130101, end:20130331}
				//Would match a query searching for 20130331
		//s
			//With (s)
			//Applies the Instant/Duration insensitive search based on *start date*
			//vs end date (default)
			//Requires the use of (i) or else is ignored
				//i.e. a Duration {start:20130101, end:20130331}
				//Would match a query searching for 20130101
		//f
			//Fuzzy search
			//A precise date does a precise match
				//i.e.	 2013-03-31T23:59:00Z
				//Only matches dates which are exactly equivalent
			//Without fuzzy search, an imprecise date is defaulted into a precise date, for a precise match
				//i.e. 2013 -defaulted-> 2013-01-01T00:00:00Z
				//Matches date which are exactly equivalent to the defaulted output
			//With fuzzy search (f) imprecise date does wider match; 
			//Identify the smallest unit stated; and create a range to catch all dates within its start and end
				//i.e. 2013 -fuzzify-> 2013-01-01T00:00:00Z-2013-12-31T23:59:00Z



//http://my.safaribooksonline.com/book/programming/regular-expressions/9780596802837/4dot-validation-and-formatting/id2983571
//Won't work in Javascript because it uses named capture groups
//Must use XRegExp instead http://xregexp.com/
/*
DateExp.ISO_8601 = /^(?<year>-?(?:[1-9][0-9]*)?[0-9]{4})-(?<month>1[0-2]|0[1-9])-?
(?<day>3[0-1]|0[1-9]|[1-2][0-9])T(?<hour>2[0-3]|[0-1][0-9]):?
(?<minute>[0-5][0-9]):(?<second>[0-5][0-9])(?<ms>\.[0-9]+)??
(?<timezone>Z|[+-](?:2[0-3]|[0-1][0-9]):[0-5][0-9])?$/;
*/