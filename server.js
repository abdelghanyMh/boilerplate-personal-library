'use strict';

const express = require('express');
const myDB = require('./db-connection');

const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //USED FOR FCC TESTING PURPOSES ONLY!


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
    .get(function(req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
    });

//For FCC testing purposes
fccTestingRoutes(app);
myDB(async(client) => {
    const myDataBase = await client.db('FCC_Personal_library').collection('books');

    //Routing for API 
    apiRoutes(app, myDataBase);
}).catch((e) => {
    app.route('/').get((req, res) => {
        res.send(`${e}, message: 'Unable to connect to db' `);
    });
});


// wait for db conntected
function sleepFor(sleepDuration) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + sleepDuration) { /* do nothing */ }
}



//Start our server and tests!
app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + process.env.PORT);
    if (process.env.NODE_ENV === 'test') {

        console.log('waiting for db conntected (4s) ...');

        console.log('Running Tests...');

        setTimeout(function() {
            try {
                runner.run();
            } catch (e) {
                let error = e;
                console.log('Tests are not valid:');
                console.log(error);
            }
        }, 4000);
    }
});

module.exports = app; //for unit/functional testing