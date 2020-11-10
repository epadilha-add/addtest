const express = require('express');
const controller = require('./controller.js')

const app = express();

app.get('/api/:destination/*', controller.destination);
app.use('/', express.static('./addtax/webapp'));

const port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("ADD-PLATFORM-UI5 - listening at port " + port);
});