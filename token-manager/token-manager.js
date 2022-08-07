const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateTokenWithId=(user_uid,expires_in)=>{
    let jwtSecretKey = "zeejintubachurail";
    return jwt.sign(user_uid, jwtSecretKey,{expiresIn:expires_in}); 
}

const verifyToken=(token)=>{
    try{
    let jwtSecretKey = "zeejintubachurail";
    const verified = jwt.verify(token, jwtSecretKey);
    return true;
    }catch(e){
        return e;
    }
}

module.exports = {
    generateTokenWithId,verifyToken
}