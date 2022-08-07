const { verifyToken } = require("../token-manager/token-manager");

const verifyJwt = (req, res, next) => {
  const authToken = req.headers.authorization.split(" ")[1];
  console.log(req.body);
  if (authToken != undefined) {
    let response = verifyToken(authToken);
    console.log("response", response);
    if (response == true) {
      console.log("Token is verified");
      next();
    } else {
      res.status(501).send({
        responseMessage: response,
      });
    }
  } else {
    res.status(502).send({
      responseMessage: "Could not find the token in request header",
    });
  }
};

//TODO:We need to create a middle ware for checking if source host is enabled to be used. Look host url status with host id
const isHostAccessUrlEnabled = (req, res, next) => {

};
//TODO:We need to create a middle ware for checking if the targeted host is allowed to use or not.
//TODO:We need to create a middle ware for checking the query and assigned role.

module.exports = { verifyJwt: verifyJwt };
