
//Any object that is on a continuous scale;
//i.e. dollars, temperatures, dates;
//A user may want to query (express) a range of these values
//i.e. less than some amount and/or greater than another amount
//The syntax for this query should be the same;
//The expression can derive from RangeExpression


RangeExp = function(s, options){
	//Allow assigning prototypes to a new RangeExp(), without passing an argument
	if(s) 	this._init(s, options);
}

//TODO: instead of an s, call it a dateExpString? [^a-zA-Z]s[^a-zA-Z]
RangeExp.prototype._init = function(s, options){
	//Invoke this base._init();
	this.s=s;
	//this.maxSpecificityInt=-1; But I couldn't override it
	this.optionString=options;
	this.options={};
	this._parseOptions();//options);
	this._setProperties();
	//Assign this.exp to whatever is appropriate, ISO_8601_DURATION
	this._validateState();
};

RangeExp.prototype._parseOptions = function(){
	//Expressions should be strings;
	//Like RegEx's, they can be configured with "options" at the end,
	//Like 'g' or 'i'

	if (this.optionString){
		this.options.fuzzy = this.optionString.indexOf('f')>-1;
	}

};	


RangeExp.prototype._validateState = function(){
	//Validate start is less than end; allow subclasses to define "less"
};


//DateExps.POINT;
//DateExps.RANGE 		= /((?:-=)|(?:=-)|(?:-)|(?:=))/; Overkill
//I'm going to co-opt my old INTERVAL symbol for the RANGE instead
RangeExp.RANGE = '->';
//An Interval has a specified start and end date  

//I thought to do a custom syntax; but Wikipedia describes something satisfactory  
//http://en.wikipedia.org/wiki/ISO_8601#Time_intervals
	//1) Start/end
	//2) Start/duration
	//3) Duration/end
	//4) Duration

//It doesn't have a notation to express whether the "bookends" should be included (inclusive) or not;
//But that's a corner case
//DateExps.INTERVAL 	= /([^(:->)]*)->([^(:->)]*)/;
//DateExps.SPAN 		= /->/;

//In summary:
// 	(()->()) Want a point between two points
//	(()->())--(()->()) Want a duration with ranges for starting and ending points

//http://my.safaribooksonline.com/book/programming/regular-expressions/9780596802837/4dot-validation-and-formatting/id2983571


RangeExp.RANGED = function(bookend, rangeSymbol){
	//bookend is a RegEx or a string representing a RegEx; example: '\d*' (identifying a number)
	//rangeSymbol defaults to '->', but can be override  

	if(!bookend) return;
	rangeSymbol 	= rangeSymbol 		|| DateExps.RANGE;	//Can override DateExpsRange default
	bookend 		= bookend.source 	|| bookend; 			//Can use a regex, or a string

	var optionalBookend = '('+ bookend + ')*',
		rangeString =  optionalBookend + rangeSymbol + optionalBookend,
		rangeRegex = new RegExp(rangeString);
		
	return rangeRegex;


};


RangeExp.MatchesExpOrExpRange = function(s, exp, rangeSymbol){

	return  s.match(exp) || s.match(DateExps.RANGED(exp, rangeSymbol));
			//exp is length 1; the part at  [0]
			//RANGED(exp) is length 3; [1] and [2]
}


RangeExp.prototype._setProperties = function(){

	//Subclasses must establish:
		//The user provides:
			//this.exp;
			//this.options;
			//this.options.fuzzy; 	// Generic enough we can accommodate in the base class

		//User does not provide, isntead, Developer / Class provides:
			//this.maxSpecificity; 	// Complements the idea of fuzzy
	this.matches = RangeExp.MatchesExpOrExpRange(this.s, /.*(?!->)/)//DateExps.MatchesExpOrExpRange(this.s, this.exp, this.rangeSymbol);
	
	if(!this.matches){
		//Validation; alert message?
	}
	else if (this.matches.length>1){

		this.startValue = this._hydrate(this.matches[1]);
		this.endValue = this._hydrate(this.matches[2]);

		if (this.startValue && this.endValue) this.hydrated = true;

		this.test = this._betweenStartAndEndValue;

	} else if (this.matches.length==1){

		var hydratedObject = this._hydrate(this.matches[0]);

		if (this._isFuzzy(hydratedObject)){ //this.matches[0])) {	 //Fuzzy are implicit ranges

				this.fuzzyOnValue = this._hydrate(this.matches[0]);

				this.startValue = this._hydrateFuzzyStart(DateExps.Clone(hydratedObject));//this.matches[0]);
				this.endValue = this._hydrateFuzzyEnd(DateExps.Clone(hydratedObject));//this.matches[0]);

				if (this.startValue && this.endValue) this.hydrated = true;

				this.test = this._betweenStartAndEndValue;

		}
		else{

			this.onValue = hydratedObject; //= this._hydrate(this.matches[0]);

			if (this.onValue) this.hydrated = true;

			this.test = this._equalsOnValue;
		}

	}

};

RangeExp.prototype._isFuzzy = function(hydratedObject){//m){
		//Theoretically we should use the second clause;
		//In this generic case now I can either give 'm' an actual specificityInt, making m an object and making native > or < comparison pretty lame
		//Or let specificityInt remain undefined
		//Since I'd have to make an arbitrary decision in the first case...
		second =(hydratedObject && hydratedObject.specificityInt < this.maxSpecificityInt);
		result = this.options.fuzzy && second;

		//console.log(this.maxSpecificityInt);
		//console.log(second);
		//console.log('--');
		//console.log(this.options.fuzzy);
		//console.log(result);
		return result;
};


		//The output is an object with expected properties like
			//specificityInt; int representing the "level"
			//specificity; string representing the "level"
RangeExp.prototype._hydrate = function(m){
	console.log('Range hydrate');
	return m;
};

RangeExp.prototype._hydrateFuzzyStart = function(m){
	//Hard to imagine a generic case for hydrateFuzzyStart, even if the expressions were strings	
	//console.log('Range hydrateFuzzyStart');
	return m;
};
RangeExp.prototype._hydrateFuzzyEnd = function(m){
	return m;
};
//The strictest/plainest implementations that I can imagine
//Would be more complex to handle;
	//1) if testObj is one of different types
//But fuzzy logic is inherently saying you're so vague (unspecific) it's a range;

RangeExp.prototype._equals = function(testObj, optionalComparisonObject){
		return ((testObj._equals && testObj._equals(optionalComparisonObject))
				|| testObj  == (optionalComparisonObject || this.onValue));

};

RangeExp.prototype._between = function(testObj){
		//Allows the user to omit start or end value, an open-ended range

		return (!this.startValue 
					|| this._greaterThan(testObj, this.startValue)
					|| this._equal(testObj, this.startValue))
				&& (!this.endValue 
					|| this._lessThan(testObj, this.endValue)
					|| this._equal(testObj, this.endValue));
};


RangeExp.prototype._greaterThan = function(a, b){
	return a._greaterThan 
			&& a._greaterThan(b) 
			|| (a>b);
};

//So this doesn't need to be over-ridden
RangeExp.prototype._lessThan = function(a, b){
	return (!this._greaterThan(a,b)) && (!this._equals(a,b));
}
