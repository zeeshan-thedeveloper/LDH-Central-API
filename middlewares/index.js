const { verifyToken } = require("../token-manager/token-manager")

const verifyJwt=(req,res,next) => {

    const authToken = req.headers.authorization.split(" ")[1];
    console.log(req.body)
    if(authToken!=undefined) {
        let response = verifyToken(authToken);
        console.log("response",response)
        if(response==true) {
            console.log("Token is verified");
            next();
        }else{
            res.status(501).send({
                responseMessage:response
            })
        }
    }else{
        res.status(502).send({
            responseMessage:"Could not find the token in request header"
        })
    }
}


module.exports = {verifyJwt:verifyJwt}