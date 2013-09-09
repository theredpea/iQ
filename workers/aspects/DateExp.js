//http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
DateExp.ISO_8601 	= new RegExp('^([\+-]?\d{4}(?!\d{2}\b))'+ 		//[1](Optional signage, year, not followed by two digits) 
								'((-?)((0[1-9]|1[0-2])' +			//[2]([3]Optional hyphen. [4]Optional([5]The month, 1-indexed
									'(\3([12]\d|0[1-9]|3[01]))?' + 		//[6](\3 Optional hyphen, [7]The day of month))
									'|W([0-4]\d|5[0-2])(-?[1-7])?' + 	//W (for "Week") [8](Week) [9]Optional(Optional hyphen, Day of Week)  	//r.exec('2009-W21-2T01:22')[8] == '21'
									'|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))' + //[9](Day of year, up to 366 [10] Day after 300)
'([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
');

//http://my.safaribooksonline.com/book/programming/regular-expressions/9780596802837/4dot-validation-and-formatting/id2983571
DateExp.ISO_8601 = /^(?<year>-?(?:[1-9][0-9]*)?[0-9]{4})-(?<month>1[0-2]|0[1-9])-?
(?<day>3[0-1]|0[1-9]|[1-2][0-9])T(?<hour>2[0-3]|[0-1][0-9]):?
(?<minute>[0-5][0-9]):(?<second>[0-5][0-9])(?<ms>\.[0-9]+)??
(?<timezone>Z|[+-](?:2[0-3]|[0-1][0-9]):[0-5][0-9])?$/;

DateExp.POINT 		= 
DateExp.SPAN 		= /->/;
DateExp.RANGE 		= /((?:-=)|(?:=-)|(?:-)|(?:=))/;
DateExp.DURATION 	= /(->)/;

DateExp = function(exp){
	this.exp = exp;
	if(exp.indexOf('->')>-1){
		var startAndEnd = exp.split('->');
		this.duration=true;
		this.
		this.durationStart = new DateExp(startAndEnd[0]);
		this.durationEnd = new DateExp(startAndEnd[1]);
	}
	else{
		this.range=false;

	}

};


/*
DateExp.prototype.match = function(dateContext){

}
*/

DateExp.prototype.test = function(dateContext){

	return true || false;
}