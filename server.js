const express = require('express'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    axios = require('axios'),
    cheerio = require('cheerio'),
    exphbs = require('express-handlebars');

const PORT = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'handlebars');

// Use morgan logger for logging requests
app.use(logger('dev'));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

app.listen(PORT, function() {
    console.log(`App running on PORT ${PORT}`);
});

const db = require('./model/index');

app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main'
    })
);

// Routes

require('./controller/api_routes')(app);

const syncOptions = { force: false };

if (process.env.NODE_ENV === 'test') {
    syncOptions.force = true;
}
// Connect to the Mongo DB

const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://localhost/unit18Populater';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

module.exports = app;
