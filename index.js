var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
var fileUpload = require('express-fileupload');
const port = process.env.DEV_PORT || 3000 ; 

const app = express();
 
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views',path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(fileUpload())

app.get("/",(req,res)=>{
    res.send("This is deployed")
})

app.listen(port, (error)=>{
    console.log(`Listening to port ${port}`)
})
