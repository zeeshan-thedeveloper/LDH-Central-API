var express = require('express');
var path = require('path');
const cors = require('cors');
var bodyparser = require('body-parser');
var fileUpload = require('express-fileupload');
var morgan = require('morgan')
const passport = require('passport');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');

require('./authentication/google-authentication');

// .env
require('dotenv').config();

// Mongodb

require('./mongodb/mongodb-connector')

// SWAGGER
const swaggerUi = require("swagger-ui-express"),
swaggerDocument = require('./swagger.json');

// configurations of enviroment varaible
dotenv.config();

// Emiter
var emiter = require('./events-engine/Emiters')
var events = require('./events-engine/Events')
const {initEvents} = require('./events-engine/Listeners')

initEvents();


// Cache
require('./cache-store/cache')

// jwt token
const {generateTokenWithId,verifyToken} =  require('./token-manager/token-manager')

// Routes
const {webportal} = require('./routes/webportalRoutes');
const {desktopApp} = require('./routes/desktopappRoutes')
const {consumer} = require('./routes/consumerRoutes')
const app = express();

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views',path.join(__dirname, 'views'))

app.set('view engine', 'ejs')

app.use(fileUpload())
app.use(morgan('combined')) 
app.use(cookieParser())   
app.use(cors({
  origin: '*'
}));
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

// Maping routes.
app.use("/auth-api",webportal);
app.use("/host-accessUrl-api",webportal);
app.use("/auth-api",desktopApp);
app.use("/host-api",desktopApp);
app.use("/consumer-api",consumer);

// Google authentication
app.get('/auth-api/googleAuthentication',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
)); 

// Github Auhentication

app.get('/auth-api/githubAuhentication',
  passport.authenticate('github', { scope: [ 'user:email' ] }
));  


app.get("/",(req, res)=>{
    res.send("its working")
})

// Authentication callbacks

app.get( '/google/callback',
  passport.authenticate( 'google', {
    successRedirect: "/auth-api/onGoogleAuthSucess",
    failureRedirect: "/auth-api/onGoogleAuthFailuer"
  })
);

app.get( '/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth-api/onGithubAuthFailuer' }),
    function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/auth-api/onGithubAuthSucess');
});

app.listen( /*process.env.PORT ||*/ 3003 , (error)=>{
    const port = process.env.PORT;
    if(!error) {
        emiter.emit(events.INIT_CACHE);
        console.log(`Listening`)
    } 
})

module.exports = {
  generateTokenWithId,verifyToken
}