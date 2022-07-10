const mongoose = require("mongoose");
const devAndAdminConSchema = new mongoose.Schema({
    developerId:{
        type:String,
        required:true
    },
    developerName:{
        type:String,
        required:false,
    },
    developerEmail:{
        type:String,
        required:false
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
    accessRole:{
        type:String,
        required:false,
        default:null
    },
    requestStatus:{
        type:String,
        required:true
    }
})

const dev_admin_con_schema = mongoose.model("dev_admin_con_schema", devAndAdminConSchema);
module.exports ={dev_admin_con_schema}
