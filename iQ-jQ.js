// iQ as jQuery plugin...

function ($) 
{
	$.fn.iQ = function() {

	}


}(jQuery);


$('#iXBRL').iQ()
		.element(
			{name:
				{contains:"Cash"}
			})
		.and()
		.pointInTime(
			{gt: "2011/01/2012"
			});


//QUERIES ON ELEMENT INFORMATION
$('#iXBRL').iQ()
		.element(
			{name:
				{contains:"Assets"}
			})
		.or()
		.element(
			{name:
				{contains:"Liabilities"}
			});

//The same as...
$('#iXBRL').iQ()
		.element(
			{name:
				{contains:"Assets|Liabilities"} //Provide a regex so matching will help
			});



$('#iXBRL').iQ()
		.element(
			{name:
				{contains:"Assets"}
			})
		.or()
		.element(
			{def:
				{contains:"Assets"}
			});


$('#iXBRL').iQ()
		.element(
			{	name:
				{contains:"Assets"},
		
				def:
				{contains:"Assets"}
			});


$('#iXBRL').iQ()
		.element(
			{	any:
				{contains:"Assets"}			
			});



['eq', 'equalTo']
['lt', 'lessThan']
['gt', 'greaterThan']
['tspan', 'spanOfTime', 'duration']
['tpoint', 'pointInTime', 'instant']
['def', 'definition']
['']