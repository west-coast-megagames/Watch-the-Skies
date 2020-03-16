const bodyParser = require('body-parser');

// Error handling and Logging
const error = require('../middleware/winston'); // middleware/error.js which is running [npm] winston for error handling
const cors = require('cors');

// Routes - Using Express
const game = require('../routes/game/game');
const admin = require('../routes/game/admin');
const del = require('../routes/game/delete');
const home = require('../routes/api/home');
const auth = require('../routes/api/auth');
const interceptor = require('../routes/api/interceptor');
const team = require('../routes/api/team');
const intercept = require('../routes/api/intercept');
const zones = require('../routes/api/zones');
const country = require('../routes/api/country');
const facilities = require('../routes/api/facilities');
const sites = require('../routes/api/sites')
const account = require('../routes/api/accounts');
const users = require('../routes/users');
const news = require('../routes/api/news');
const logs = require('../routes/api/log');
const banking = require('../routes/api/banking');
const research = require('../routes/api/research');
const military = require('../routes/api/military');
const article = require('../routes/api/articles');
const logError = require('../routes/api/logErrors');
const logInfo = require('../routes/api/logInfo');
//const initData = require('../routes/api/initData');

const control = require('../routes/api/control');


module.exports = function(app) {
    // Bodyparser Middleware
    app.use(bodyParser.json());

    // Cors use to allow CORS (Cross-Origin Resource Sharing) [Remove before deployment!]
    app.use(cors());

    // Express Routes - Endpoints to connect to through the browser. (Housed routes folder)
    app.use('/', home);
    app.use('/game', game);
    app.use('/game/admin', admin);
    app.use('/game/delete', del);
    app.use('/api/auth', auth);
    app.use('/api/interceptor', interceptor); // Route for manipulating interceptors
    app.use('/api/team', team); // Route for Teams
    app.use('/api/intercept', intercept); // Route for triggering an interception
    app.use('/api/zones', zones); // Route for inputing zones
    app.use('/api/country', country); // Route for inputing countries
    app.use('/api/facilities', facilities); // Route for inputing countries
    app.use('/api/sites', sites) // Route for sites
    app.use('/api/accounts', account); // Route for inputing accounts
    app.use('/user', users); // Route for dealing with Users
    app.use('/api/news', news); // Route for the news desks
    app.use('/api/logs', logs); // Route for logs
    app.use('/api/banking', banking); // Route for banking functions
    app.use('/api/research', research); // Route for banking functions
    app.use('/api/military', military); // Route for manipulating militarys
    app.use('/api/articles', article); // Route for manipulating articles
    app.use('/api/logErrors', logError); // Route for manipulating logError
    app.use('/api/logInfo', logInfo); // Route for manipulating logInfo
    //app.use('/api/initData', initData); // Route for Init Data functions

    app.use('/api/control', control)

    app.use(error.routeError);
}