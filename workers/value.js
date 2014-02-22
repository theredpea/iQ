iQ.prototype.fact = {

    transform : function(sValue, sTransformation)
    {
        //TODO: Transform properly

    },

    mapScale : function(i, jTag)
    {
        return this.fact.scale(jTag);
    },

    scale : function(jTag)
    {
        jTag = $(jTag);
        sValue = jTag.text(), 
        sScale = jTag.attr('scale') || '0';

        if (sValue.match(/[A-Za-z]/g))
        {

            //A text block
            //TODO: Check the datatype of the element?
            //Or check if it has a transform attribute?
            return NaN;
        }

        nScaledValue = parseFloat(sValue.replace(/,/g, ''));

        if (isNaN(nScaledValue))
        {

            return NaN;
        }

        nScale = parseInt(sScale);
        
        return nScaledValue * Math.pow(10, nScale);
    }

};
