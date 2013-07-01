

    jQueryResults = [];
    arrayResults = [];
    stringResults = [];
    convertResults = [];

    var jPreQualElements;
    for (var i=0;  i<100; i++)
    {

    this._measureIt(function() { jPreQualElements = $(sPreQualElements); }, 'Using jQuery', jQueryResults);
    //this._measureIt(function() { jPreQualElements = document.querySelectorAll(lPreQualElements); }, 'Using document.querySelectorAll with array of names', arrayResults);
    this._measureIt(function() { jPreQualElements = document.querySelectorAll(sPreQualElements); }, 'Using document.querySelectorAll, array of names joined with comma', stringResults);
    this._measureIt(function() {  jPreQualElements = $(jPreQualElements);   }, 'Converting NodeList to jQuery object', convertResults);
    //console.log(jPreQualElements.constructor);
    //console.log(jPreQualElements.constructor);
    }

    
    function sum(a) {
        var s=0;
        for (var j=0; j<a.length; j++)
        {
            s+=a[j];
        }
        return s;
    }

    function divide(a, b)
    {
        var c=[];
        for (var j=0; j<a.length; j++)
        {
            c.push(a[j]/b[j]);
        }
        return c;
    }
    //arraySum = sum(arrayResults);
    stringSum = sum(stringResults);
    jQuerySum = sum(jQueryResults);
    fractionResults = divide(convertResults, stringResults);
    fractionSum = sum(fractionResults);

    console.log('jQuery average ' + jQuerySum/jQueryResults.length);
    //console.log('fraction average ' + fractionSum/fractionResults.length);
    //console.log('array average ' + arraySum/arrayResults.length);///arrayResults.length);
    console.log('string average ' + stringSum/stringResults.length);///stringResults.length);