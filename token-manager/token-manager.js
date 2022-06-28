const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateTokenWithId=(user_uid)=>{
    let jwtSecretKey = "zeejintubachurail";
    return jwt.sign(user_uid, jwtSecretKey); 
}

const verifyToken=(token)=>{
    let jwtSecretKey = "zeejintubachurail";
    const verified = jwt.verify(token, jwtSecretKey);
    return verified;
}

module.exports = {
    generateTokenWithId,verifyToken
}