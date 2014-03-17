 
iQ.prototype._processHeader = function()
{
  	
    this.$header = $('ix\\:header');

  	this.$header.find('xbrli\\:context').each(
  		$.proxy(
  		this.getContextRef, this));

  	this.$header.find('xbrli\\:unit').each(
            $.proxy(this.getUnitRef, this));


};

iQ.prototype.average = function()
{
    var sum=0;
    var count =0;
    this.values().forEach(function(v,i,a){
        sum+=v;
        count++;
    })
    return sum/count;
}

iQ.prototype.makeFilterStats = function(){

    if (!this.filterStats)
    {
        this.filterStats = $('#filterStats');

    }

    if(this.filterStats.length==0)
    {
        this.filterStats = $('<div></div>').attr('id', 'filterStats').append($('<table></table>').prepend($('<thead></thead>'), $('<tbody></tbody>'))).appendTo('html');
    }
}

iQ.prototype.makeConsole = function(){
    /*
    makeConsole: function()
    {
    */

            if (!this.iQconsole)
            {
                this.iQconsole = $('#iQconsole');

            }

            if ($('#iQconsole').length==0)
            {

                this.body.on('iQ_filterStats',  $.proxy(this.showFilterStats, this));
                this.iQconsole = $('<div></div>').attr('id', 'iQconsole').appendTo('html');
            }

    /*
    }
    */
}

  $(document).ready(function(){




      q = new iQ();
  });

  