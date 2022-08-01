var express = require("express");
var path = require("path");
const cors = require("cors");
var bodyparser = require("body-parser");
var fileUpload = require("express-fileupload");
var morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// process/threads
const { watchHosts_Service } = require("./processes/processes");

const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const websocketListener = new Server(server);
let streamWriter;

global.globalSocket = null;

require("./authentication/google-authentication");

// .env
require("dotenv").config();

// Mongodb

require("./mongodb/mongodb-connector");

// SWAGGER
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");

// configurations of enviroment varaible
dotenv.config();

// Emiter
var emiter = require("./events-engine/Emiters");
var events = require("./events-engine/Events");
const { initEvents } = require("./events-engine/Listeners");

initEvents();

// Cache
require("./cache-store/cache");

// jwt token
const {
  generateTokenWithId,
  verifyToken,
} = require("./token-manager/token-manager");

// Routes
const { webportal } = require("./routes/webportalRoutes");
const { desktopApp } = require("./routes/desktopappRoutes");
const { consumer } = require("./routes/consumerRoutes");
const {
  addUpdate_available_and_connected_host_list_cache,
  addUpdate_developers_host_access_url_request_list_cache,
  removeItemFrom_available_and_connected_host_list_cache,
} = require("./cache-store/cache-operations");
const { Worker } = require("worker_threads");
const {
  hosts_info_list_cache,
  available_and_connected_host_list_cache,
} = require("./cache-store/cache");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

app.use(fileUpload());
app.use(morgan("combined"));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
  })
);
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Maping routes.
app.use("/auth-api", webportal);
app.use("/web-api", webportal);
app.use("/host-accessUrl-api", webportal);
app.use("/auth-api", desktopApp);
app.use("/host-api", desktopApp);
app.use("/consumer-api", consumer);

// Google authentication
app.get(
  "/auth-api/googleAuthentication",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Github Auhentication

app.get(
  "/auth-api/githubAuhentication",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get("/", (req, res) => {
  res.send("its working");
});

// Authentication callbacks

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth-api/onGoogleAuthSucess",
    failureRedirect: "/auth-api/onGoogleAuthFailuer",
  })
);

app.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth-api/onGithubAuthFailuer",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/auth-api/onGithubAuthSucess");
  }
);

// hostStatusManager process

// hostStatusManager.on('message', (msg) => {
//   console.log("Message sent from hostStatusManager"+msg)
// });

// host joining are.

websocketListener.on("connection", (socket) => {
  // console.log('a user connected with id:',socket.id);
  // console.log(socket.io.engine.id);
  global.globalSocket = socket;
  socket.on("joining", function (hostId, hostDeviceId, payload) {
    console.log("MSG", hostId, " saying ", hostDeviceId);
    
    addUpdate_available_and_connected_host_list_cache(
      hostId,
      hostDeviceId,
      "connected"
    );

    if (payload != null) {
      const { requestId, query, databaseName, response } = JSON.parse(payload);
      addUpdate_developers_host_access_url_request_list_cache(
        hostId,
        requestId,
        query,
        databaseName,
        response
      );
    }
  });

  socket.on("resolvingMySQL", (payload) => {
    const { requestId, hostId, query, databaseName, response, hostDeviceId } =
    JSON.parse(payload);
    console.log("Data received from host is : ", JSON.parse(payload));
    console.log("Current socket id for joining host",socket.id)
    addUpdate_developers_host_access_url_request_list_cache(
      hostId,
      requestId,
      query,
      databaseName,
      response
    );
    
    addUpdate_available_and_connected_host_list_cache(
      hostId,
      hostDeviceId,
      "connected",
      socket.id
    );
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }
    console.log("on disconnect", reason);
    console.log("Disconnected host is ",socket.id)
    removeItemFrom_available_and_connected_host_list_cache(socket.id);
  });
});

//host watcher

// setInterval(() => {
//   let available_and_connected_host_list =
//     available_and_connected_host_list_cache.get(
//       "available_and_connected_host_list_cache"
//     );
//   watchHosts_Service(available_and_connected_host_list)
//     .then((watchResponse) => {
//       console.log(watchResponse);
//     })
//     .catch((err) => {
//       console.log("error", err);
//     });
// }, 3000);

module.exports = {
  generateTokenWithId,
  verifyToken,
  websocketListener,
  server,
};
