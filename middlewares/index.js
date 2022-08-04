const { verifyToken } = require("../token-manager/token-manager")

const verifyJwt=(req,res,next) => {
    const authToken = req.headers.authorization.split(" ")[1];
    if(authToken!=undefined) {
        let response = verifyToken(authToken);
        if(response==true){
            console.log("Token is verified");
            next();
        }else{
            res.status(501).send({
                responseMessage:e
            })
        }
    }else{
        res.status(502).send({
            responseMessage:"Could not find the token in"
        })
    }
}


module.exports = {verifyJwt:verifyJwt}