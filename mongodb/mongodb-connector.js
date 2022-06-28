const mongoose = require("mongoose");
mongoose.connect(
  // `mongodb+srv://zeeshan:zeeshan@local-database-hosting.ipmhboj.mongodb.net/ldh-central-api?retryWrites=true&w=majority`, 
  `mongodb://127.0.0.1:27017/ldh-central-api`,
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