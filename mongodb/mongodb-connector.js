const mongoose = require("mongoose");
mongoose.connect(
  `mongodb+srv://zeeshan:zeeshan@local-database-hosting.ipmhboj.mongodb.net/ldh-central-api?retryWrites=true&w=majority&ssl=true`, 
  // `mongodb://zeeshan:m9mg1AF0REGsqbsa@ac-z7spiov-shard-00-00.ipmhboj.mongodb.net:27017,ac-z7spiov-shard-00-01.ipmhboj.mongodb.net:27017,ac-z7spiov-shard-00-02.ipmhboj.mongodb.net:27017/ldh-central-api?ssl=true&replicaSet=atlas-68jhda-shard-0&authSource=admin&retryWrites=true&w=majority`,
  // `mongodb://127.0.0.1:27017/ldh-central-api`,
  {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  }
); 
 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully to mongo db online hosted");
});
module.exports=db;