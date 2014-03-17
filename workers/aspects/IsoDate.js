
	DateCall = Date.bind(new Date());
	
	IsoDate = function(o){
		//Accepts an object like
		//{month:12, day:20, year: 2014}
		//Puts them in the order of DateExps.POINT_PARTS
		//Which is the order Date needs them

		var hasParts = false,
			constructArgs = []
		for (part in DateExps.POINT_PARTS){
			var part = DateExps.POINT_PARTS[part].name,
				dePart = DateExps.DePartName(part); //partO = (part+'Part');

			if (dePart in o || part in o){
				o[dePart] = o[dePart] || o[part];
				hasParts = true;
				if (!o[part]) { continue; }
				constructArgs.push(o[part]);// || 0); 
			} else{
				//constructArgs.push(0);
				continue;
			}
		}

		//In the order of Date constructor requirements.
		if (hasParts){
			this.Date= new DateCall(constructArgs); //Date.construct(constructArgs);
		}
		


	};
