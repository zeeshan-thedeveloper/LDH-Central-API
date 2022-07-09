const mongoose = require("mongoose");
const devAndAdminConSchema = new mongoose.Schema({
    developerId:{
        type:String,
        required:true
    },
    adminId:{
        type:String,
        required:true
    },
    requestTimeAndData:{
        type:String,
        required:true
    },
    listOfDatabases:{
        type:Array,
        default:[]
    },
    requestStatus:{
        type:String,
        required:true
    }
})

const dev_admin_con_schema = mongoose.model("dev_admin_con_schema", devAndAdminConSchema);
module.exports ={dev_admin_con_schema}
