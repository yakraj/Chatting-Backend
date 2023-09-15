const ConnectChatRequest = (db, Uniqid) => (req, res) => {
  const { reqfrom, reqto, message } = req.body;
  const ReqId = Uniqid(reqfrom.substring(0, 4) + reqto.substring(0, 4));
  db("chatreq")
    .insert({
      reqid: ReqId,
      reqfrom: reqfrom,
      reqto: reqto,
      message: message,
      status: false,
      date: new Date(),
    })
    .then((response) => {
      db("chatreq")
        .select(
          "chatreq.*",
          "users.name",
          "users.address",
          "users.avatar",
          "users.cover",
          "users.desig",
        )
        .join("users", "chatreq.reqto", "users.userid")
        .where("chatreq.reqfrom", reqfrom)
        .then((response) => {
          res.json(response).status(200);
        })
        .catch((err) => res.json(err).status(400));
    })
    .catch((err) => res.json(err).status(400));
};

const CancelReq = (db) => (req, res) => {
  const { reqid, user } = req.body;
  db("chatreq")
    .where("reqid", reqid)
    .del()
    .then((deleted) => {
      db("chatreq")
        .select(
          "chatreq.*",
          "users.name",
          "users.address",
          "users.avatar",
          "users.cover",
          "users.desig",
        )
        .join("users", "chatreq.reqto", "users.userid")
        .where("chatreq.reqfrom", user)
        .then((response) => {
          res.json(response).status(200);
        })
        .catch((err) => res.json(err).status(402));
    });
};

const ChatDataReq = (db) => (req, res) => {
  const { userid } = req.body;
  db("chatreq")
    .select(
      "chatreq.*",
      "users.name",
      "users.address",
      "users.avatar",
      "users.cover",
      "users.desig",
    )
    .join("users", "chatreq.reqfrom", "users.userid")
    .where("chatreq.reqto", userid)
    .then((response) => {
      res.json(response).status(200);
    })
    .catch((err) => res.json(err).status(400));
};

const PendingArchives = (db) => (req, res) => {
  const { userid } = req.body;
  db("chatreq")
    .select(
      "chatreq.*",
      "users.name",
      "users.address",
      "users.avatar",
      "users.cover",
      "users.desig",
    )
    .join("users", "chatreq.reqto", "users.userid")
    .where("chatreq.reqfrom", userid)
    .then((response) => {
      res.json(response).status(200);
    })
    .catch((err) => res.json(err).status(400));
};

const AcceptChatReq = (db, Uniqid) => (req, res) => {
  const { reqfrom, reqto, reqid } = req.body;
  // here it will create not only the report on delete recent chatreq row also
  const ChatId = Uniqid(reqfrom + reqto);
  db("chatreq")
    .where("reqid", reqid)
    .del()
    .then((response) => {
      db("chatarchive")
        .insert({
          user1: reqfrom,
          user2: reqto,
          connectedon: new Date(),
          chatid: ChatId,
        })
        .then((created) => {
          //  it will return the data of new chatarchive
          db("chatarchive")
            .select(
              "chatarchive.*",
              "users.name",
              "users.userid",
              "users.online",
              "users.avatar",
            )
            .join("users", function () {
              this.on(function () {
                this.on("chatarchive.user1", "=", "users.userid").andOn(
                  "chatarchive.user2",
                  "=",
                  db.raw("?", [reqto]),
                );
              }).orOn(function () {
                this.on("chatarchive.user2", "=", "users.userid").andOn(
                  "chatarchive.user1",
                  "=",
                  db.raw("?", [reqto]),
                );
              });
            })
            .then((response) => {
              res.json(response).status(200);
            });
        });
    });
};

const ChatArchiveData = (db) => (req, res) => {
  const { user } = req.body;
  db("chatarchive")
    .select(
      "chatarchive.*",
      "users.name",
      "users.userid",
      "users.online",
      "users.avatar",
    )
    .join("users", function () {
      this.on(function () {
        this.on("chatarchive.user1", "=", "users.userid").andOn(
          "chatarchive.user2",
          "=",
          db.raw("?", [user]),
        );
      }).orOn(function () {
        this.on("chatarchive.user2", "=", "users.userid").andOn(
          "chatarchive.user1",
          "=",
          db.raw("?", [user]),
        );
      });
    })
    .then((response) => {
      res.json(response).status(200);
    })
    .catch((err) => res.json(err).status(400));
};
module.exports = {
  ConnectChatRequest: ConnectChatRequest,
  ChatDataReq: ChatDataReq,
  PendingArchives: PendingArchives,
  AcceptChatReq: AcceptChatReq,
  ChatArchiveData: ChatArchiveData,
  CancelReq: CancelReq,
};
