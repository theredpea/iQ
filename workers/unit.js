'use strict';

importScripts('../scripts/require.js');

define(['./base'], function(base){

	addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);

	getInvertedKey = function(obj) {
		//TODO: Delegate prefix, localPart to subworkers?
		return obj.unitRef;
	};

	init = function(args){
		//Defaults
		if (!self.initted){
			//http://www.xe.com/symbols.php
			//http://www.xe.com/iso4217.php
			self.currencyIndex = {
				'$':'USD',
			}


			self.prototype.init.call(self,args);
		}

		//}
	};

	stringFilter = function(query, args){
		//throw (new String(this.aspectIndex));
		//if (self.currencyIndex[query]) { //query)>-1){ It's not an array
				//Convert $ to USD, or something
				//But be aware there are multiple countries who share a symbol for different currencies
		query= self.currencyIndex[query] || query;
		//};

		return function(object) {
			//True if the regex matches
			//object.key;		//		The simple thing; string representing it;
			//object.aspect; // 		The complex thing; maybe DateContext object, whatever
			
			return object.aspect == query; //regEx.test(object.aspect);		//For a string; key == aspect
		}
	}
});