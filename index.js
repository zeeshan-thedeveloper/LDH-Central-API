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
require('./google-authentication/google-authentication');
// .env
require('dotenv').config();

// Mongodb

// require('./mongodb/mongodb-connector')

// SWAGGER
const swaggerUi = require("swagger-ui-express"),
swaggerDocument = require('./swagger.json');

// Emiter
var emiter = require('./events-engine/Emiters')
var events = require('./events-engine/Events')
const {initEvents} = require('./events-engine/Listeners')
initEvents();

// jwt token
require('./token-manager/token-manager')

// Routes
const {authRouter} = require('./routes/webportalRoutes');

const app = express();

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views',path.join(__dirname, 'views'))

app.set('view engine', 'ejs')

app.use(fileUpload())
app.use(morgan('combined')) 
app.use(cookieParser())
app.use(cors());
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);

// Maping routes.
app.use("/auth-api",authRouter)
 

// google authentication
app.get('/auth-api/googleAuthentication',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));


function isLoggedIn(req, res, next) {
  
    console.log(req.cookies)
    if(req.user){
        console.log("looged in ") 
        console.log(req.user)
        next();
    }
    else{
        console.log("Not looged in ")
        console.log(req.user)
        res.status(401).send({responseMessage:"Un-authorized"})
    }
}

app.get( '/google/callback',
  passport.authenticate( 'google', {
    successRedirect: "/auth-api/onGoogleAuthSucess",
    failureRedirect: "/auth-api/onGoogleAuthFailuer"
  })
);



// app.get("/onGoogleAuthSucess",(req,res)=>{
//     console.log("At protected gooogle")
//     console.log(req.user);
//     res.cookie("logged-in-user",req.user)
//     res.send("yes we are in")
// })

// app.get("/onGoogleAuthFailuer",(req, res) => {
//     res.send("google auth-fail");
// })

// app.get("/auth-api/logout",(req,res)=>{
//      req.logout(req.user, err => {
//         if(err) return next(err);
//         req.session.destroy();
//         res.send("logedout")
//     });
// })


app.listen( /*process.env.PORT *||*/ 3000 , (error)=>{
    const port = process.env.PORT;
    if(!error) {
        emiter.emit(events.INIT_CACHE);
        console.log(`Listening`)
    } 
})