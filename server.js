var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 3000)); // o 8080
app.use(express.static(__dirname + '/public')); // public es la carpeta donde esta el html

app.listen(app.get('port'), function() {
  console.log('Servidor corriendo en ', app.get('port'));
});
