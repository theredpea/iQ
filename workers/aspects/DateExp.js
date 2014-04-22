importScripts('aspects/DateExps.js','aspects/PointExp.js','aspects/DurExp.js');

DateExp = function(s, options){
	this.s = s;
	this.optionString = options;

	//A router 
	var pointMatch = PointExp.matches(s), //RangeExpDateExps.MatchesExpOrExpRange(s, DateExps.ISO_8601 POINT),
		durMatch = DurExp.matches(s); //DateExps.MatchesExpOrExpRange(s, DateExps.ISO_8601 DURATION);

	if(pointMatch && pointMatch.length>-1){
		this.exp = new PointExp(s, options); //new PointExp().constructor.apply(this, [s, options]); 
		this.point = true;
	}
	else if(durMatch && durMatch.length>-1){
		this.exp = new DurExp(s, options); //new DurExp().constructor.apply(this, [s, options]);
		this.duration=true;
	}

	//Extend DateExp
	for (prop in this.exp){
		if (!this[prop]) this[prop] = this.exp[prop];
	}
	//Transferrance
	/*
	if(this.exp && this.exp.hydrated){
		if (this.)
		this.
	}*/

	//Interval of time
		//Ranged Interval of time
	/*
	else if(DateExps.MatchesExpOrExpRange(s, DateExps.ISO_8601_DURATION).length>-1){

	}*/


};

/*
DateExp.prototype.match = function(dateContext){

}
*/

DateExp.prototype.test = function(dateContext){
	return true || false;
}
