//From http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/

var shouldWork = ['2009-12T12:34',
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

var shouldNotWork = ['200905',
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
'2010-02-18T16,25:23:48,444']
/*

table=iQ.el('table');
thead=iq.el('thead');
theadrow = iQ.el('tr')
theadrow.appendChild(iQ.el('th'))
tbody = iQ.el('tbody');
*/

var tbody=iQ.first('#tbody');
tbody.innerHTML='';
shouldWork.concat(shouldNotWork).forEach(function(e,i,a){
	var should=false,
		fail=false;
	if (i<shouldWork.length) should=true;

	//console.log(e.match(DateExps.ISO_8601_INDEX));
	if (should) { if (!DateExps.ISO_8601_INDEX.test(e)) {console.log('false negative with ' + e); fail=true;}}
	else { if (DateExps.ISO_8601_INDEX.test(e)) {console.log('false positive with ' + e); fail=true;} }
	match = e.match(DateExps.ISO_8601_INDEX);
	matchLength = match ? match.length : 0;
	matchString = match ? match.join(',') : ''
	tbody.innerHTML+='<tr><td>'+e+'</td><td>'+matchLength+'</td><td>'+matchString+'</td><td>'+(fail?'Fail':'Pass')+'</td></tr>'
});
/*
shouldNotWork.forEach(function(e,i,a){

	//console.log(e.match(DateExps.ISO_8601_INDEX));
	if (DateExps.ISO_8601_INDEX.test(e)) console.log('false positive with ' + e);
});
*/