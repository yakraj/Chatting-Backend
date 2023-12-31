const AddUser = (db, Uniqid, bcrypt) => (req, res) => {
  const { name, desc, email, address, cover, avatar, pass } = req.body;
  const Userid = Uniqid(name.substring(0, 4));
  bcrypt.hash(hash, 10, function (err, pass) {
    db("users")
      .insert({
        name: name,
        desig: desc,
        userid: Userid,
        email: email,
        address: address,
        cover: cover,
        online: true,
        avatar: avatar,
      })
      .then((response) => {
        db("crediantials")
          .insert({
            userid: Userid,
            email: email,
            hash: pass,
          })
          .then((ress) => {
            res.json("successfully added crediantials").status(200);
          })
          .catch((err) => res.send(err).status(400));
      })
      .catch((err) => res.send(err).status(400));
  });
};

const UserLogIn = (db, bcrypt) => (req, res) => {
  const { umail, pass } = req.body;
  db.select("userid", "hash")
    .from("crediantials")
    .where("userid", umail)
    .orWhere("email", umail)
    .then((response) => {
      if (response.length) {
        bcrypt.compare(pass, response[0].hash, function (err, result) {
          if (err) {
            res.send("userid or password wrong").status(400);
          } else {
            if (result) {
              db.select("*")
                .from("users")
                .where("userid", response[0].userid)
                .then((resp) => {
                  res.json(resp).status(200);
                });
            } else {
              res.send("wrong crediantials");
            }
          }
        });
      }
    });
};

const SearchUser = (db) => (req, res) => {
  const { user } = req.body;
  db.select("*")
    .from("users")
    .where("userid", "ilike", `%${user}%`)
    .orWhere("name", "ilike", `%${user}%`)
    .then((users) => {
      res.json(users);
    });
};

const SingleUser = (db) => (req, res) => {
  const { user } = req.body;
  db.select("*")
    .from("users")
    .where("userid", user)
    .then((users) => {
      res.json(users);
    });
};

// here it is the update section

const UpdateName = (db) => (req, res) => {
  const { user, name } = req.body;
  db("users")
    .update({ name: name })
    .where("userid", user)
    .then((response) => {
      db("users")
        .select("*")
        .where("userid", user)
        .then((data) => {
          res.json(data).status(200);
        });
    })

    .catch((er) => res.json(err));
};

// here i'll update my useravatar with connecting cloudinary api


const UpdateAvatar = (db,cloudinary) =>(req,res)=>{

const image = req.body.fileData; 
  console.log(req.body)
}


module.exports = {
  AddUser: AddUser,
  UserLogIn: UserLogIn,
  SearchUser: SearchUser,
  SingleUser: SingleUser,
  UpdateName: UpdateName,
  UpdateAvatar: UpdateAvatar,
};
