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
DateExps.ISO_8601_DURATION		= new RegExp('P(\d*\.\d*)*Y*(\d*\.\d*)*M*(\d*\.\d*)*D*(T(\d*\.\d*)*H*(\d*\.\d*)*M*(\d*\.\d*)*S*)*')
DateExps.POINT;
DateExps.SPAN 		= /->/;
DateExps.RANGE 		= /((?:-=)|(?:=-)|(?:-)|(?:=))/;
DateExps.DURATION 	= /([^(:->)]*)->([^(:->)]*)/;


//http://my.safaribooksonline.com/book/programming/regular-expressions/9780596802837/4dot-validation-and-formatting/id2983571

DateExps.PARTS  = [
				{name:'yearPart', 		match:1},
				{name:'monthPart', 		match:5},
				{name:'dayPart', 		match:7},
				{name:'hourPart', 		match:15},
				{name:'minutePart', 	match:16},
				{name:'secondPart', 	match:19}];
				
DateExp = function(exp){
	this.exp = exp;

	this.isDuration = this.exp.match(DateExps.DURATION);

	if(this.isDuration){//exp.indexOf('->')>-1){
		//var startAndEnd = exp.split('->');
		//var isoMatch;
			this.durationStart = new DateExp(this.isDuration[1]);
			this.durationEnd = new DateExp(this.isDuration[2]);

		}
	else{
		//See DateExp_UnitTests.js for reference to match 
		this.expMatch8601 = this.exp.match(DateExps.ISO_8601_INDEX);
		//this.expMatch8601 = this.exp.match(DateExps.ISO_8601_INDEX);
		this.jsDate = new Date(this.exp);

		for(i in DateExps.PARTS){
			var part = DateExps.PARTS[i];
			if(!this.expMatch8601){continue;}
			this[part.name] = this.expMatch8601[part.match];

			if (!this[part.name] && !this.specificity){ //Go to the lowest possible specificity
				this.specificity =  DateExps.PARTS[i-1].name;
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