

// Returns true if the two iXBRL values are "aligned"
// "Alignment" is like implicit filtering:
// http://www.xbrl.org/WGN/XBRL-formula-overview/PWD-2011-12-21/XBRL-formula-overview-WGN-PWD-2011-12-21.html#section-implicit-filtering
// iQ uses the idea of 'covered' and 'uncovered'
// @method alignment
//
// @param {iQ object}
// @param {iQ object}
// @return {bool} true if the two iXBRL values are "aligned". Uses the first parameter's uncovered aspects
// @static
iQ.alignment = function(a, b)
{

};


// Produces a x b
// @method _cartesianProduct
//
// @param {iQ object} first object, typically the "left operand" in an operation
// @param {iQ object} second object, typically the "right operand"
// @return {multidimensional array} the first dimension represents all the first objects, the second dimension the second objects
// @NOTE: At first it was just going to return a multidimensional array
// But then I get concerned that it's already looping through these dimensions testing for alignment, so it should operate while it's at it?
// @static
iQ._cartesianProduct = function(a, b)
{

    a.get().each(function(firstIndex, firstDOMObject){
        b.get().each(function(secondIndex, secondDOMObject){



        });
    }); //A for loop would also enumerate its builtin properties and methods -- no good


};


iQ._produceValueFunc = function(valueFunc)
{
    return function(a,b,c)
    {

        var newValue = valueFunc(iQ._parseValue(a), iQ._parseValue(b));

        return c
                .text(newValue)
                .data('value', newValue)
                .attr('data-value', newValue);

    };
};


//TODO: Don't just provide an operateFunc, which will produce something
    //And it only gets to act on their values
//Provide a produceFunc, which will act on the whole jQuery objects (or iQ objects?), to produce a new jQuery/iQ object
//Provide a whereFunc, which will test for alignment -- in addition to the implicit filtering.
//For example, to test that the duration begins one day after the startingBalance
//And the end begins one day after the endingBalance

iQ._operate = function(operateFunc)
{
    return iQ._cartesianProduct(a,b,iQ._produceValueFunc(operateFunc));
};


// Produces an iQ object which aligns and sums the params
// @method sum
//
// @param {iQ object} iQ object which is left operand
// @param {iQ object} iQ object which is right operand
// @return {iQ object} iQ object which is summed
// @static

iQ._add = function(a, b)
{
    return iQ._operate(function(a,b){ return a+b; });
};


// Produces an iQ object which aligns the param to the 'this' iQ object
// @method sum
//
// @param {iQ object} iQ object which becomes right operand
// @return {iQ object} iQ object which is summed
iQ.prototype.addTo = function(b)
{
    return iQ._add(this, b);
};

