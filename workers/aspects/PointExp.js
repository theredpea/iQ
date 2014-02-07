define('PointExp', ['RangeExp'], function(RangeExp){

	PointExp = function(s, options){ 

				//this.exp;
				//this.options;
				//this.options.fuzzy; 	// Generic enough we can accommodate in the base class
		this.exp = DateExps.ISO_8601_POINT;
		this.parts = DateExps.POINT_PARTS; //Establish at this point
		//TODO:Extract options, or make that its own method?

		//Override when needed?
		this.maxSpecificityInt=6;

		this.constructor.apply(this, [s, options]);

		
	};

	//Inheritance
	PointExp.prototype = new RangeExp();


	PointExp.prototype._betweenStartAndEndValue = function(){

	};

	PointExp.prototype._equalsOnValue = function(){

	};

	//TODO: Instead of making this extensible by a "brother" class; DurExp
	//Build this as default implementation;
	//Make this.parts be provided in the setup, just like this.exp (after all, this.parts is primarily serving as the named capture group regex equivalent)

	PointExp.prototype._setSpecificity = function(hydratedObject, currentName, previousName, specificityInt){

				if (!hydratedObject[currentName] && !hydratedObject.specificity){ 
					//i.e. this does not allow for resuming specificity;
					//It is stopped as soon as you don't declare something in the order
					hydratedObject.specificity =  previousName; 
					hydratedObject.specificityInt = specificityInt;

				}

	};

	PointExp.prototype._hydrate = function(m, parts){


			var specificityInt = 0,//-1, Because maxSpecificytInt is set to 1;
				parts = this.parts || parts || DateExps.POINT_PARTS,
				hydratedObject = {
								jsDate 			: new Date(m),
								match 			: this.s.match(this.exp), //m.match(this.exp),
								specificity 	: undefined,
								specificityInt 	: specificityInt,
								parts 			: parts,
								exp 			: m,
								//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FWorking_with_Objects#Defining_getters_and_setters
								get partsList()  { 	var that = this; 

														return that.parts.map(function(part,i,a){ 
															//So that if they are deFuzzied, and assigned default values, they show
															return that[DateExps.DePartName(part)]; }); 
								},
								getPartsList	: function() { 	
													var that = this; 

														return that.parts.map(function(part,i,a){ 
															//So that if they are deFuzzied, and assigned default values, they show
															return that[DateExps.DePartName(part)]; }); 
								}
							};


			for(index in parts){	//Must go in-order, because specificity rules apply

				var part = parts[index],			// ex { name: 'datePart', matchIndex: 0}	
					currentName = part.name,
					previousName = parts[index-1] ? parts[index-1].name : ''; //Affects specificity	

				hydratedObject[currentName] = hydratedObject.match[part.matchIndex];
				
				this._setSpecificity(hydratedObject, currentName, previousName, specificityInt);

				specificityInt++;

				//Use 'Part' to represent the raw value of the match, like 'yearPart' represents the string '2013', 
					//or maybe even '2013-', depending on the regex; totally unprocessed
				//Strip off 'Part' to represent the intended value/type of the match, like 'year' represents the int 2013
				var tryParse = hydratedObject[part.name],
					valueName = part.name.replace('Part', '');
					
				//Common processing for all of the parts of the Point exp
				if (tryParse) tryParse = tryParse
											.replace(':','')
											.replace('-','');

				try{
					hydratedObject[valueName] = parseFloat(tryParse);

					if(!hydratedObject[valueName])
						throw {name: valueName, value: hydratedObject[valueName], message:'ParseException'};//!(parseFloat)'};
				}
				catch(e){
					//Since I'm dealing with a copy...
					hydratedObject[valueName]=-1;
					console.log(e.message); 
					//'Could not parseFloat (or else it produced NaN, undefined, null...) for name:\n\t' + 
					//				part.name + '\nvalue:\n\t' + tryParse);
				}

			}
			
			//Make sure the date is valid
			//http://stackoverflow.com/a/1353711/1175496
			if (isNaN(hydratedObject.jsDate.getTime())){
				hydratedObject.jsDate =  new IsoDate(hydratedObject).Date;
			}

			//TODO: How to manage more elegantly? What do I mean 'elegant'?
				//Part of a constructor?
				//I already to the .match() here
				//Well, one overload for constructor is to accept pre-.matched()
				//Which should basically map a JS object as if it were Python kwargs, and guide it into JS native's Date constructor

			return hydratedObject;

	};

	PointExp.prototype._hydrateFuzzy = function(hydratedObject, hydrateFunc, parts){
		var parts = this.parts || parts || DateExp.POINT_PARTS,
			deFuzzied=0,
			partName;



		//
		for (i=hydratedObject.specificityInt; i<parts.length; i++){
			part = parts[i];
			partName = DateExps.DePartName(part);
			//console.log(partName);
			//console.log(hydratedObject[partName]);
				//Interesting example: "2009-12T12:34"
				//Notice how it has two fuzzieds
				hydrateFunc(hydratedObject, partName);
		}

		//console.log(fuzzied);
		//console.log(hydratedObject);
		//console.log(this.exp);
		return hydratedObject;

	}
	///HydrateFuzzyStart is also used for a vague date... depending on whether it's start or end?
	PointExp.prototype._hydrateFuzzyStart = function(hydratedObject, parts){

		var deFuzzied =0,
			fuzzyStart =function(hydratedObject, partName){
				if (hydratedObject[partName] == -1){
					deFuzzied++;
					hydratedObject[partName]=1;	
				}
		};

		return this._hydrateFuzzy(hydratedObject, fuzzyStart);


	};
	PointExp.prototype._hydrateFuzzyEnd = function(hydratedObject, parts){
		//var hydratedObject = this._hydrate(m);
		
		var deFuzzied =0,
			endMap = {
				//year:0,	//Crazy
				month:12,
				//day:0,	//Depends. Damn.
				hour:24,
				minute:59,
				second:59
			},
			miliMap = {
				get second() { return 1000; },
				get minute() { return this.second*60; },
				get hour() { return this.minute*60; },
				get day() { return this.hour*24; },
				//get month() { return this.day*30; },

			},
			jsMap = {'day':'date'}, //Javascript's getDate returns what I call the dayPart
			fuzzyEnd =function(hydratedObject, partName){
				var m = hydratedObject.jsDate.valueOf();
				//TODO:This is wrong
				hydratedObject.jsDateSecondBack = new Date(m-(endMap[partName]||miliMap[partName]));

				if (hydratedObject[partName] == -1){
					var newPartName = partName;
					if (newPartName in jsMap) newPartName = jsMap[newPartName];

					var titlePartName = newPartName.substring(0,1).toUpperCase() + newPartName.substring(1),
						getPart = 'get'+titlePartName,
						getParts = getPart +'s',
						monthAdjusted = false;

					//TODO:Convert to UTC
					if (hydratedObject.jsDateSecondBack[getPart]){
						deFuzzied++;
						hydratedObject[partName] = hydratedObject.jsDateSecondBack[getPart]();

					} else if (hydratedObject.jsDateSecondBack[getParts]){
						deFuzzied++;
						hydratedObject[partName] = hydratedObject.jsDateSecondBack[getParts]();

					}
					if(partName=='month'){	// && monthAdjusted){
						hydratedObject[partName]++; //Because it's 0-indexed
					}
				}
		};
		
		return this._hydrateFuzzy(hydratedObject, fuzzyEnd);
	};
	
	return PointExp;
});