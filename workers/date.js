
importScripts('base.js');

self.prototype
 = self.Base;

addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);


//cascadeWorkers


getInvertedKey = function(obj) {
    return obj.contextRef;
}

DateExp = function(exp){
	this.exp = exp;

}
/*
DateExp.prototype.match = function(dateContext){

}
*/

DateExp.prototype.test = function(dateContext){

	return true || false;
}

//Takes a string, produces a function which acts on the object;
stringFilter = function(query){
	var dateExp = new DateExp(query);

	return function(object){
		
		return dateExp.test(object.aspect);
	}
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
}

init = function(args){
	/*
	self.query = {
                matches : self.matches,


                }

            };
            */
	self.prototype.init.call(self, args);

    //throw JSON.stringify(this.invertedIndex==undefined);

};

matches = function(args){

		var regValue = event.data.queryValue instanceof RegExp ?
							event.data.queryValue
							: new RegExp(event.data.queryValue)
}