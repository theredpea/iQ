//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}

//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";
 
    if (this == null)
      throw new TypeError();
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();
 
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }
 
    return res;
  };
}

//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter
if (!String.prototype.endsWith)
{
  String.prototype.endsWith = function(endsWithString)
  {
 
    return this.slice(-endsWithString.length)==endsWithString;
  };
}

//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter
if (!String.prototype.extension)
{
  String.prototype.extension= function()
  {
 
    return this.slice(this.lastIndexOf(".")+1)
  };
}




var Shim = {};

Shim.fileApiSupported = function()
{

    return (window.File && window.FileReader && window.FileList && window.Blob);
}


//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
if (Shim.fileApiSupported() && !FileList.prototype.forEach ) {
  FileList.prototype.forEach = function(fn, scope) {
    for(var f, i = 0; f=this[i]; i++) {
      fn.call(scope, this[i], i, this);
    }
  }
}

//https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;
 
    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
 
      var result = [];
 
      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }
 
      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
};