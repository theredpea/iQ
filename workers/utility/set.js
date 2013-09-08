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

 function and(a,b){
 	var args=Array.prototype.slice.call(arguments, 0);
 	args.sort(lengthAscending);//sortArgsLengthAscending(arguments);

 	//throw(args.length);
 	//throw(args);
 	//Optimization
 	return intersection.apply(this, args);

 }



 function or(a,b){
 	var args=arguments;
 	//args.sort(function(i,j){return j.length-i.length;});
 	return union.apply(this, args);

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
		return union.apply(this, [or(arguments[0], arguments[1])].concat(Array.prototype.splice.call(arguments, 2)));
	}
	else if (arguments.length==1){
 		//console.log('==length==1');
		return arguments[0];
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
    