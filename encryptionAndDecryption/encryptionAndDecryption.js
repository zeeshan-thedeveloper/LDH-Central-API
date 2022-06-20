const Cryptr = require('cryptr');
const cryptr = new Cryptr('zeethejinandtubathechurail');
module.exports ={
    encrypt: (data)=>{
        return cryptr.encrypt(data);
    },
    decrypt: (data)=>{
        return cryptr.decrypt(data);
    }
}
