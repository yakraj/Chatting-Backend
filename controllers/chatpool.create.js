// this route will handle adding chat , it also contains polling here
var pollContent = [];





// var existingPool = pollContent.filter((x)=> Math.abs(new Date() - new Date(x.time)) > 5000)
const exstfinder = () => {
  return pollContent.filter(
    (x) => Math.abs(new Date() - new Date(x.time)) > 20000
  );
};


// here i'm going to start pooling center

function LoopDeleter() {



  if (pollContent.length) {



    var deletefinder = exstfinder();
    for (let res of deletefinder) {
      res.Res.json([]).status(404);
      pollContent = pollContent.filter((f) => f !== res)
      
      
    }
  }
    setTimeout(() => {
      LoopDeleter();
    }, 1000);
  }
  LoopDeleter();


  
const EmitChat = (db,chatid, userto,filterRes) => {
   for (let poll of filterRes) {
      db("chats")
      .orderBy("id", "desc")
      .limit(1)
      .where("chatid", chatid)
      .then((rows) => {
          
          poll.Res.json(rows);
        });
    }
  };


const CreateChat =(db) =>(req,res) =>{
  const { userfrom, userto, textmsg, imagemsg, chatid, messageid } = req.body;
  db("chats")
    .insert({
      userfrom: userfrom,
      userto: userto,
      textmsg: textmsg,
      imagemsg: imagemsg ? imagemsg : [],
      seen: false,
      delivery: true,
      chatid: chatid,
      messageid: messageid,
      date: new Date(),
    })
    .then((created) => {
      db("chatarchive")
        .update({ lastmsg: textmsg,lastmod: new Date() }).where('chatid',chatid)
        .then((archive) => {
          
          res.json([{ chatid: chatid, messageid: messageid }]).status(200);
filterRes = pollContent.filter((x) => x.userid === userto);
    pollContent = pollContent.filter((x) => x.userid !== userto);
          if(filterRes.length){
          EmitChat(db,chatid, userto,filterRes);}
        })
        .catch((err) => res.json("chat archive error" + err).status(400));
    })
    .catch((err) => res.json("single chat error" + err).status(400));

}

const PollChat = ()=>(req,res)=>{
    let data = {
      Res: res,
      userid: req.body.userid,
      time: new Date(),
    };
    pollContent.push(data);
  }



const GetChats =(db) =>(req,res)=>{
    const { chatid } = req.body;
    db("chats")
      .select("*")
      .where("chatid", chatid)
      .then((chats) => {
        res.json(chats).status(200);
      })
      .catch((err) => res.json(err).status(400));
  }
module.exports = {
    CreateChat:CreateChat,
    PollChat: PollChat,
    GetChats:GetChats
};