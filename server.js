const emiter = require("./events-engine/Emiters");
const events = require("./events-engine/Events");
const { server } = require("./index");

server.listen( process.env.PORT || 3003 , (error)=>{
    const port = process.env.PORT;
    if(!error) {
        emiter.emit(events.INIT_CACHE);
        console.log(`Listening`)
    } 
})
