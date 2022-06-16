const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateTokenWithId=(user_uid,)=>{
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    return jwt.sign(user_uid, jwtSecretKey); 
}

const verifyToken=(token)=>{
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const verified = jwt.verify(token, jwtSecretKey);
    return verified;
}

module.exports = {
    generateTokenWithId,verifyToken
}