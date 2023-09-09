const db = require('./database').db

let OnlineUsers = [];

const exstfinder = () => {
  return OnlineUsers.filter(
    (x) => Math.abs(new Date() - new Date(x.time)) > 120000
  );
};

const OfflineMaker = () => {
  if (OnlineUsers) {
    var offlineFinder = exstfinder();
    if (offlineFinder) {
      for (let res of offlineFinder) {
        db('users').update({
          online:false
        }).where('userid',res.userid).then(response => response)
        OnlineUsers = OnlineUsers.filter(x => x.userid !== res.userid)
      }
    }
  }

  setTimeout(() => {
    OfflineMaker();
  }, 5000);
};

OfflineMaker();

const SendStatus = () => (req, res) => {
  const { userid } = req.body;
  
  db('users').update({
    online:true
  }).where('userid',userid).then(response => response)
  
  
  let tempData = {
    userid: userid,
    time: new Date(),
  };

  let ExistList = OnlineUsers.some(x => x.userid === userid)
  if(ExistList){
    OnlineUsers = OnlineUsers.filter(x => x.userid !== userid)
  }
  OnlineUsers.push(tempData);
  res.end().status(200);
};


// throught this function client willl get online status of users
const GetStatus = () =>(req,res) =>{
  const {users}  = req.body;
  db('users').select('userid','online').whereIn('userid',users).then(response => res.json(response).status(200)).catch(err => res.json(err).status(404))
}

// from here i'll be creating mesageseen data
// 
// 
// ...............................
// +++++++++++++++++++++++++++++++
// ===============================


let StoreSeen = []
// three things will be stored here in the object 
// {userid: "",chatid: "",date: date}

// it will store all seen requests from client 
let StoreSeenReqs = []
// this will also store three values 
// {userid:"",res: value ,time: ""}

// this is another polling for chat seen messages 

const Exstfinder = () => {
  return StoreSeenReqs.filter(
    (x) => Math.abs(new Date() - new Date(x.time)) > 20000
  );
};


function SeenReqRemove() {
  if (StoreSeenReqs.length) {
    var removefind = Exstfinder();
    for (let res of removefind) {
      res.res.json('nothing').status(204);
    }
  }
  removefind &&
    removefind.map((x) => (StoreSeenReqs = StoreSeenReqs.filter((f) => f !== x)));
  setTimeout(() => {
    SeenReqRemove();
  }, 1000);
}
SeenReqRemove();



const CreateSeenChat = ()=>(req,res) =>{
  const {userid,chatid} = req.body;
  const tempObject = {
    userid: userid,
    chatid: chatid,
    date: new Date()
  }
  let findExst = StoreSeen.some(x => x.chatid === chatid)
  if(findExst){
    StoreSeen = StoreSeen.filter(x=> x.chatid !== chatid);
  }

// it will find including users those are waiting for seen response

let waiters = StoreSeenReqs.find(x=> x.userid === userid)
StoreSeenReqs = StoreSeenReqs.filter(x=> x.userid !== userid)
if(waiters){
  waiters.res.json([tempObject])
  db('chats').update({seen: true}).where('chatid',chatid).andWhere('seen',false).andWhere('userfrom', userid).then(response => response)
}else{
  StoreSeen.push(tempObject);
}
  res.json('nothing to send').status(200)
}

const ReqSeenVal = () =>(req,res) =>{
  const {userid}  = req.body;
  const TempObject = {
    userid: userid,
    time: new Date(),
    res: res
  }

let findAlreadyData = StoreSeen.filter(x=> x.userid === userid);

if(findAlreadyData.length){
  res.json(findAlreadyData)
  StoreSeen =StoreSeen.filter(x=> x.userid !== userid)
}else{
  StoreSeenReqs.push(TempObject)
}


}



module.exports = {
  SendStatus: SendStatus,
  GetStatus:GetStatus,
  CreateSeenChat:CreateSeenChat,
  ReqSeenVal:ReqSeenVal
};
