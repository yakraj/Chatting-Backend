require('dotenv').config()
const express = require("express");
const cloudinary = require('cloudinary').v2;
const cors = require("cors");
const bodyParser = require("body-parser");
const Uniqid = require("uniqid");
const bcrypt = require("bcrypt");

// here i'm importing controllers
const ChatPollCreate = require("./controllers/chatpool.create");
const chatarchiveReq = require("./controllers/chatarchive.req");
const Crediantials = require("./controllers/crediantials");
const Databases = require("./controllers/database");
const liveWorker = require("./controllers/live.workers");
const crediantials = require("./controllers/crediantials");

const db = Databases.db;
const app = express();
//configuration of cors for multiple thread requests
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 3600,
  }),
);
// configuration of cloudinary for upload image 
   cloudinary.config({
     cloud_name: 'Chatting App',
     api_key: process.env.CLOUDINARY_API,
     api_secret: process.env.CLOUDINARY_SECRET
   });



app.use(bodyParser.json());
// here is the time to configure our database postgres with knex

app.get("/", (req, res) => {
  db("chatarchive")
    .select("*")
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});
app.get("/users", (req, res) => {
  db("users")
    .select("*")
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});


//here is the call for insert usersdata and crediantials
app.post("/adduser", Crediantials.AddUser(db, Uniqid, bcrypt));

// this route will handle login users
app.post("/login", Crediantials.UserLogIn(db, bcrypt));

// this code will handle all people search result of peoples

app.post("/searchuser", Crediantials.SearchUser(db));

// this will handle call of single user
app.post("/singleuser", Crediantials.SingleUser(db));

// now from here it will create chatRequests to connect
app.post("/chatreq", chatarchiveReq.ConnectChatRequest(db, Uniqid));

// this will handle all chat requests that are come to the user
app.post("/chatrequests", chatarchiveReq.ChatDataReq(db));

// this will handle wll chat requests that has been send to others
app.post("/pending/chatrequests", chatarchiveReq.PendingArchives(db));

// while person wants to cancel his chat request

app.post("/cancel/chatreq", chatarchiveReq.CancelReq(db));

// a special route for accepet chat request and cretae a new chatarchive connection
app.post(
  "/connectio/accept-chat-req",
  chatarchiveReq.AcceptChatReq(db, Uniqid),
);

// now here on this server will provide data of chatarchive
app.post("/chatarchive", chatarchiveReq.ChatArchiveData(db));
// this route wil
app.post("/createchat", ChatPollCreate.CreateChat(db));
// this will return all chats from single chatid
app.post("/getchats", ChatPollCreate.GetChats(db));
// main component for creating chatpool and update to user
app.post("/getpollchats", ChatPollCreate.PollChat());
// it will receive online status from user and user and store it as online
app.post("/send/online-status", liveWorker.SendStatus());
// it will receive online status from user and user and store it as online
app.post("/get/online-status", liveWorker.GetStatus());
// this route will handle to make changes in message seen status
app.post("/crete/chats/seen-send/status", liveWorker.CreateSeenChat());
// through out this request the client will lookup who is there online and which chatid is being seen
app.post("/get/chats/seen-status", liveWorker.ReqSeenVal());

// here i'm going to use some update and modify routes for users

app.put("/update/user/name", crediantials.UpdateName(db));
//this route willl be used for update avatar image of user
app.put("/update/user/avatar", crediantials.UpdateAvatar(db,cloudinary));

const port = 5001;
app.listen(port, () => {
  console.log("server is running on " + port);
});
