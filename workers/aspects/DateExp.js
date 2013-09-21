//http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
//TODO: Replace single backslashes with double backslashes

DateExps={}
DateExps.ISO_8601_POINT 	= new RegExp('^([\\+-]?\\d{4}(?!\\d{2}\\b))'+ 									//[1](Optional signage, year, not followed by two digits) 
								'((-?)((0[1-9]|1[0-2])' +										//[2]([3]Optional hyphen. [4]Optional([5]The month, 1-indexed
									'(\\3([12]\\d|0[1-9]|3[01]))?' + 								//[6](\\3 Optional hyphen, [7]The day of month))
									'|W([0-4]\\d|5[0-2])(-?[1-7])?' + 							//W (for "Week") [8](Week) [9]Optional(Optional hyphen, Day of Week)  	//r.exec('2009-W21-2T01:22')[8] == '21'
									'|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))' + 		//[10](Day of year, up to 366 [11] Day after 300)
									'([T\\s]((' 		+ 											//[12]T [13]([14]Optional(...
									'([01]\\d|2[0-3])((:?)[0-5]\\d)?|24\\:?00)'		+			//[15](Hour of the day)[16]Optional([17](Optional colon), Minute of the hour) , or it could be 24:00, but its minute parts aren't captured
									'([\\.,]\\d+(?!:))?)?'			+ 							//[18] Optional(Period or comma, and one or more digits - fractional parts of second -  not followed by [19]colons) end [/14]
									'(\\17[0-5]\\d([\\.,]\\d+)?)?' 		+							//[19]  Optional( \\17 Optional Colon Minute of the hour [20]Optional(Fractional Minute))
									'([zZ]|([\\+-])([01]\\d|2[0-3]):?([0-5]\\d)?)?)?)?$');			// [21] z or Z for UTC or [22] +/-, [23]Hours offset, An optional colon, [24] Minutes Offset


//The smallest value used can have a fractional version 
DateExps.ISO_8601_DURATION		= new RegExp('(P(\d*\.\d*)*Y*(\d*\.\d*)*M*(\d*\.\d*)*D*)(T(\d*\.\d*)*H*(\d*\.\d*)*M*(\d*\.\d*)*S*)*');
DateExps.POINT;
//DateExps.RANGE 		= /((?:-=)|(?:=-)|(?:-)|(?:=))/; Overkill
//I'm going to co-opt my old INTERVAL symbol for the RANGE instead
DateExps.RANGE = '->';
//An Interval has a specified start and end date  

//I thought to do a custom syntax; but Wikipedia describes something satisfactory  http://en.wikipedia.org/wiki/ISO_8601#Time_intervals
//Which allows four ways to express a Duration, which is cool
//Don't want to use Solidus, aka forward slash, in case these are stored in filenames

//It doesn't have a notation to express whether the "bookends" should be included (inclusive) or not;
//But that's a corner case
//DateExps.INTERVAL 	= /([^(:->)]*)->([^(:->)]*)/;
//DateExps.SPAN 		= /->/;

//In summary:
// 	(()->())
//	(()->())--(()->())

//http://my.safaribooksonline.com/book/programming/regular-expressions/9780596802837/4dot-validation-and-formatting/id2983571

DateExps.POINT_PARTS  = [
				{name:'yearPart', 		match:1},
				{name:'monthPart', 		match:5},
				{name:'dayPart', 		match:7},
				{name:'hourPart', 		match:15},
				{name:'minutePart', 	match:16},
				{name:'secondPart', 	match:19}];

DateExps.DURATION_PARTS  = [
				//{name:'datePart', 		match:1},
				{name:'yearPart', 		match:2},
				{name:'monthPart', 		match:3},
				{name:'dayPart', 		match:4},
				//{name:'timePart', 		match:5},
				{name:'hourPart', 		match:6},
				{name:'minutePart', 	match:7},
				{name:'secondPart', 	match:8}];
				

DateExps.RANGED = function(bookend, rangeSymbol){
	if(!bookend) return;
	rangeSymbol = rangeSymbol || DateExps.RANGE;

	var optionalBookend = '('+bookend.source + ')*',
		rangeString =  optionalBookend + rangeSymbol + optionalBookend,
		rangeRegex = new RegExp(rangeString);
		
	return rangeRegex;


};

DateExps.MatchesExpOrExpRange = function(s, exp, rangeSymbol){

	return s.match(exp) 							//Should have a length of 1; on part is at [0]
			|| s.match(DateExps.RANGED(exp, rangeSymbol));		//Should have a length of 3; start and end parts are at [1] and [2]
}

RangeExp = function(s){
	this._init(s);
}

RangeExp.prototype._init(s){
	//Invoke this base._init();
	this.s=s;
	this._setProperties();
	//Assign this.exp to whatever is appropriate, ISO_8601_DURATION
	this._validateState();
};



RangeExp.prototype._validateState = function(){

	//Validate start is less than end; allow subclasses to define "less"
};


RangeExp.prototype._setProperties = function(){

	//Subclasses must establish:
		//The user provides:
			//this.exp;
			//this.options;
			//this.options.fuzzy; 	// Generic enough we can accommodate in the base class

		//User does not provide, isntead, Developer / Class provides:
			//this.maxSpecificity; 	// Complements the idea of fuzzy
	this.matches = DateExps.MatchesExpOrExpRange(this.s, this.exp, this.rangeSymbol);

	if(!this.matches){
		//Validation; alert message?
	}
	else if (this.matches.length>1){

		this.startValue = this._hydrate(this.matches[1]);
		this.endValue = this._hydrate(this.matches[2]);

		this.testFunc = this._betweenStartAndEndValue;

	} else if (this.matches.length==1){

		if (this._isFuzzy(this.matches[0])) {	 //Fuzzy are implicit ranges
				this.startValue = this._hydrateFuzzyStart(this.matches[0]);
				this.endValue = this._hydrateFuzzyEnd(this.matches[0]);

				this.testFunc = this._betweenStartAndEndValue;

		}
		else{

			this.onValue = this._hydrate(this.matches[0]);
			this.testFunc = this._equalsOnValue;
		}

	}

};

RangeExp.prototype._isFuzzy = function(m){
		//Theoretically we should use the second clause;
		//In this generic case now I can either give 'm' an actual specificityInt, making m an object and making native > or < comparison pretty lame
		//Or let specificityInt remain undefined
		//Since I'd have to make an arbitrary decision in the first case...
		return this.options.fuzzy && (this._hydrate(m).specificityInt < this.maxSpecificityInt);
};


		//The output is an object with expected properties like
			//specificityInt; int representing the "level"
			//specificity; string representing the "level"
RangeExp.prototype._hydrate = function(m){
	return m;
};

RangeExp.prototype._hydrateFuzzyStart = function(m){
	//Hard to imagine a generic case for hydrateFuzzyStart, even if the expressions were strings	
	return m;
};
RangeExp.prototype._hydrateFuzzyEnd = function(m){
	return m;
};
//The strictest/plainest implementations that I can imagine
//Would be more complex to handle;
	//1) if testObj is one of different types
//But fuzzy logic is inherently saying you're so vague (unspecific) it's a range;

RangeExp.prototype._equalsOnValue = function(testObj, optionalComparisonObject){
		return testObj == (optionalComparisonObject || this.onValue);

};

RangeExp.prototype._betweenStartAndEndValue = function(testObj){
		//Allows the user to omit start or end value, an open-ended range
		return (!this.startValue || this._greaterThan(testObj, this.startValue)) 
				&& (!this.endValue || this._lessThan(testObj, this.endValue));
};


RangeExp.prototype._greaterThan = function(a, b){
	return a>b;
};

//So this doesn't need to be over-ridden
RangeExp.prototype._lessThan = function(a, b){
	return (!this._greaterThan(a,b)) && (!this._equalsOnValue(a,b));
}






PointExp = function(args){ 
	RangeExp.constructor.apply(this, args);
};

PointExp.prototype = new RangeExp(); //RangeExp.prototype;

PointExp.prototype._hydrate = function(m){

};

//Apply RangeExp's constructor?
DurExp = function(args){ 
	RangeExp.constructor.apply(this, args);
};
DurExp.prototype = new RangeExp(); //RangeExp.prototype;



/*
//Encompasses the two concepts PointExp and DurExp
//Overkill? 

InterExp = function(){}
InterExp.prototype = RangeExp.prototype;
*/

//Encompasses all three, PointExp, DurExp, InterExp
DateExp = function(exp){
	this.exp = exp;

	//'Range of' is something that can be abstracted...
	//Changes the properties from 'onDate' to 'startDate' and 'endDate'
	//And the test from 'equals' to 'greater than', and/or 'less than'

	//But the main flavor of their expression should be determined first

	//Point in time
		//Range of point in time

	//Duration of time
		//Range of duration of time

	//Interval of time
		//Ranged Interval of time

	this.isDuration = this.exp.match(DateExps.INTERVAL)				//
					|| this.exp.match(DateExps.ISO_8601_DURATION);

	if(this.isDuration){//exp.indexOf('->')>-1){
		//var startAndEnd = exp.split('->');
		//var isoMatch;
			this.durationStart = new DateExp(this.isDuration[1]);
			this.durationEnd = new DateExp(this.isDuration[2]);

		}
	else{
		//See DateExp_UnitTests.js for reference to match 
		this.expMatch8601 = this.exp.match(DateExps.ISO_8601_POINT);
		//this.expMatch8601 = this.exp.match(DateExps.ISO_8601_POINT);
		this.jsDate = new Date(this.exp);

		specificityInt=0;
		for(i in DateExps.POINT_PARTS){
			var part = DateExps.POINT_PARTS[i];
			//if(!this.expMatch8601){continue;}
			this[part.name] = this.expMatch8601[part.match];

			if (!this[part.name] && !this.specificity){ 
				//Go to the lowest possible specificity...
				//Wait, while this is an allowable scenario, it's strange, how does it help us implement fuzzy?
				//5 years and 3 days, makes sense; 5 years 3 days, 0 hours, 0 minutes, 0 seconds, 
				//to 5 years, 3 days, 24 hours, 0 minutes, 0 seconds

				//But year 2013, day 14... it doesn't make sense? It must follow a month.
				this.specificity =  DateExps.POINT_PARTS[i-1].name;
			}
			if(this[part.name]){
				this.specificity = undefined;//part.name; // At least as specific as this
			}
			//else{
					var tryParse = this[part.name],
						valueName = part.name.replace('Part', '');
					if (tryParse) tryParse = tryParse.replace(':','').replace('-','');
					//console.log(tryParse);
				try{
					this[valueName] = parseFloat(tryParse);
					console.log(this[valueName]);
					if(isNaN(this[valueName]) || this[valueName] == undefined || this[valueName]==null){throw new Exception();}
				}
				catch(e){
					this[valueName]=0;
					console.log('Could not parseFloat for: ' + part.name + ', value: ' + tryParse);
				}

			//}
		}


	}
		


			

};


/*
DateExp.prototype.match = function(dateContext){

}
*/


DateExp.prototype.test = function(dateContext){

	return true || false;
}

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