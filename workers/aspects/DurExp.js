define('DurExp', ['DateExps', 'RangeExp'], function(DateExps, RangeExp){
	//Apply RangeExp's constructor?
	DurExp = function(s, options){ 

				//this.exp;
				//this.options;
				//this.options.fuzzy; 	// Generic enough we can accommodate in the base class
		this.exp = DateExps.ISO_8601_DURATION;
		this.parts = DateExps.DURATION_PARTS; //Establish at this point
		//TODO:Extract options, or make that its own method?

		this.constructor.apply(this, [s, options]);//arguments);

	};

	DurExp.prototype = new RangeExp(); //RangeExp.prototype;

	/*
	DurExp.prototype._hydrate = function(m){
		PointExp.prototoype._hydrate.apply(this, DateExps.DURATION_PARTS);

	};*/

	DurExp.prototype._setSpecificity = function(hydratedObject, currentName, previousName, specificityInt){
		PointExp.prototoype._setSpecificity.apply(this, [hydratedObject, currentName, previousName, specificityInt]);

		//Reset specificity, allow it to continue moving down the chain; a Month duration isn't necessary  if they've provided a day duration
		if(hydratedObject[currentName]){
			hydratedObject.specificity=undefined;
		}

	};

	return DurExp;

})