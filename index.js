var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
var fileUpload = require('express-fileupload');
var morgan = require('morgan')

// Emiter
var emiter = require('./events-engine/Emiters')
var events = require('./events-engine/Events')
const {initEvents} = require('./events-engine/Listeners')
initEvents();
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


// Maping routes.
app.use("/auth-api",authRouter)

app.listen( process.env.PORT || 3000 , (error)=>{
    if(!error) {
        emiter.emit(events.INIT_CACHE);
        console.log(`Listening`)
    }
})