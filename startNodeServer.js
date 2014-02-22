var express = require('express');
var app = express();

app.get('/', function(request, response){
	response.send('Hello world');
});

var port = 8090;
app.use(express.static(__dirname));
app.listen(port);
console.log('Listening on port: ' + port);
