//From http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/

Tests = {};

Tests.shouldWork = ['2009-12T12:34',
'2009',
'2009-05-19',
'2009-05-19',
'20090519',
'2009123',
'2009-05',
'2009-123',
'2009-222',
'2009-001',
'2009-W01-1',
'2009-W51-1',
'2009-W511',
'2009-W33',
'2009W511',
'2009-05-19',
'2009-05-19 00:00',
'2009-05-19 14',
'2009-05-19 14:31',
'2009-05-19 14:39:22',
'2009-05-19T14:39Z',
'2009-W21-2',
'2009-W21-2T01:22',
'2009-139',
'2009-05-19 14:39:22-06:00',
'2009-05-19 14:39:22+0600',
'2009-05-19 14:39:22-01',
'20090621T0545Z',
'2007-04-06T00:00',
'2007-04-05T24:00',
//'',
'2010-02-18T16:23:48.5',
'2010-02-18T16:23:48,444',
'2010-02-18T16:23:48,3-06:00',
'2010-02-18T16:23.4',
'2010-02-18T16:23,25',
'2010-02-18T16:23.33+0600',
'2010-02-18T16.23334444',
'2010-02-18T16,2283',
'2009-05-19 143922.500',
'2009-05-19 1439,55']

Tests.shouldNotWork = ['200905',
'2009367',
'2009-',
'2007-04-05T24:50',
'2009-000',
'2009-M511',
'2009M511',
'2009-05-19T14a39r',
'2009-05-19T14:3924',
'2009-0519',
'2009-05-1914:39',
'2009-05-19 14:',
'2009-05-19r14:39',
'2009-05-19 14a39a22',
'200912-01',
'2009-05-19 14:39:22+06a00',
//
'2009-05-19 146922.500',
'2010-02-18T16.5:23.35:48',
'2010-02-18T16:23.35:48',
'2010-02-18T16:23.35:48.45',
'2009-05-19 14.5.44',
'2010-02-18T16:23.33.600',
'2010-02-18T16,25:23:48,444'];

Tests._indexProvider = function(){
    var indexMap = {};
    Tests.shouldWork.forEach(function(e,i,a){ 
    	indexMap[e]= {
                contextRef: e,
                index: i,
                ixType: "IX:NONNUMERIC",
                name: "test:date",
                value: e
            };
    });
    return indexMap;
};

Tests._aspectProvider = function(){
    var dateMap = {};
    Tests.shouldWork.forEach(function(e,i,a){ 
    	dateMap[e] = {
                entity: {
                    identifier: "TEST",
                    scheme: "TEST"
                },
                id: e,
                index: i,
                period: {
                    endDate: undefined,
                    endDateDate: undefined,
                    instant: e,
                    instantDate: Date(e),
                    startDate: undefined,
                    startDateDate: undefined
                },
                segment: {}
            };

	});
	//Only testing dateWorker
	return { date : dateMap };

};
//TODO Separate table for Durations?
Tests.instanceTests = function(){

	tbody = iQ.firstNode('tbody');

	//Dependency injection
	iQ && iQ._init && iQ._init({
		_indexProvider	: Tests._indexProvider,
		_aspectProvider : Tests._aspectProvider
	});

    Tests.shouldWork.forEach(function(e,i,a){ 

		iQ()
			.date(e)
			.get(function(args){

			var should=(i<Tests.shouldWork.length),
				fail=false,
				//New test; testing iQ results
				passFailString = args.results.length==1 ?  'pass' : 'fail',
				isoString='false';

			try{
				isoString=new Date(e).toISOString(); } 
			catch(e){}
				tbody.innerHTML ++
					'<tr class="'+ isoString +' '+ passFailString + '"><td class="'+shouldString+'">'+shouldString+
						'</td><td>'+e+
						'</td><td class="pass-fail">'+passFailString+ 
						'</td></tr>';

		}); 
	});
}

Tests.durationTests = function(){

	duration = {

	}

	duration.shouldWork = ['P2013'];
	duration.shouldNotWork = [];
	duration.test = function(){
		duration.Tests.shouldWork.forEach(function(e,i,a){

			var match = e.match(DateExps.ISO_8601_DURATION)
		});
	}

}
/*
Tests.shouldNotWork.forEach(function(e,i,a){

	//console.log(e.match(DateExps.ISO_8601_POINT));
	if (DateExps.ISO_8601_POINT.test(e)) console.log('false positive with ' + e);
});
*/


		//
		//["2010-02-18T16:23:48,444", 		[0]
		//"2010", 							[1]		yearPart
		//"-02-18T16:23:48,444", 			[2]
		//"-", 								[3]
		//"02-18", 							[4]
		//"02", 							[5]		monthPart
		//"-18", 							[6]
		//"18",  							[7]		dayPart
		//undefined,  						[8]
		//undefined, 						[9] 
		//undefined, 						[10] 
		//undefined, 						[11] 
		//"T16:23:48,444", 					[12] 
		//"16:23", 							[13] 	
		//"16:23", 							[14] 
		//"16", 							[15] 	hourPart
		//":23", 							[16] 	minutePart (plus)
		//":", 								[17] 
		//undefined, 						[18] 
		//":48,444", 						[19] 	secondPart (plus)
		//",444", 							[20] 
		//undefined, 						[21] 
		//undefined, 						[22] 
		//undefined, 						[23] 
		//undefined, 						[24] 
		//index: 0, 						[25] 
		//input: "2010-02-18T16:23:48,444"] 							[1]
		Tests.instanceTests();
		Tests.durationTests();