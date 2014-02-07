importScripts('../base.js');

self.prototype = self.Base;

addEventListener('message', function(event){ self.prototype.onMessage.call(self,event) }, false);

init = function(args){

};

//All based on http://jsperf.com/union-array-faster/5 to use fastest union/intersection logic

function sortArgsLengthAscending(argumentsFromAnotherFunction){

 	//sortFunc
 	//Returns less-than-zero if i comes first
 	//Return greater-than-zero if j comes first
 	//What we want to come first is the one with less length
 	//So we want a negative value if it's less length
 	//So we should subtract the less-length minus the more-length

 	//Doesn't work
 	var args = Array.prototype.slice.call(argumentsFromAnotherFunction, 0);
 	return args.sort(function(i,j){return i.length-j.length;}); //http://stackoverflow.com/questions/960866/converting-the-arguments-object-to-an-array-in-javascript
 }

 function lengthAscending(i,j){return i.length-j.length;};

function flatten(twoDimArray){
    //http://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
    var flattened = [];
    return flattened.concat.apply(flattened, twoDimArray);
};

function flattenArgs(args){
	if (args.flatten){
 		args[0] = this.flatten(args[0]);
 		args[1] = this.flatten(args[1]);
 	}
 	return [args[0], args[1]];

}
 function and(args){

 	var results = intersection.apply(this, this.flattenArgs(args));
 	args.results = results;
 	self.postMessage(args);

 }



 function or(args){
 	//Base.js uses call(); therefore arguments will come in directly

 	//args.sort(function(i,j){return j.length-i.length;});
 	var results=union.apply(this, this.flattenArgs(args));
 	args.results = results;

 	self.postMessage(args);

 }


 function intersection(a, b) {
 	//console.log(a);
 	//console.log(b);
 	//console.log('===');
 	if (arguments.length>2){ 
 		//console.log('==length>2');
		return intersection.apply(this, [intersection(arguments[0], arguments[1])].concat(Array.prototype.splice.call(arguments, 2)));
	}
	else if (arguments.length==1){
 		//console.log('==length==1');
		return arguments[0];
	}
	else if (arguments.length==0){
		return [];
	}
	else{
		var keys, i, len, common;
      	keys = {};
      	for (i = 0, len = a.length; i < len; i++) {
        	keys[a[i]] = true;
      	}
      	common = [];
      	for (i = 0, len = b.length; i < len; i++) {
        	if (keys[b[i]] !== undefined) {
          	common[common.length] = b[i];
        	}
      	}
      	return common;
	}
      
};

function union(a,b){
 	if (arguments.length>2){ 
 		//console.log('==length>2');
		return union.apply(this, [union(arguments[0], arguments[1])].concat(Array.prototype.splice.call(arguments, 2)));
	}
	else if (arguments.length==1){
 		//console.log('==length==1');
		return arguments[0];
	}
	else if (arguments.length==0){
		return [];
	}
	else{
	  var obj = {},
	    i = a.length,
	    j = b.length,
	    newArray = [];
	  while (i--) {
	    if (!obj[a[i]]) {
	      obj[a[i]] = true;
	      newArray.push(a[i]);
	    }
	  }
	  while (j--) {
	    if (!obj[b[j]]) {
	      obj[b[j]] = true;
	      newArray.push(b[j]);
	    }
	  }
	  return newArray;

	}

};
    