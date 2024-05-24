const path = require("path");
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI = process.env.DB_CONNECTION_STRING;

console.log('MONGODB_URI', MONGODB_URI);


const app = express();
const sessionStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csurf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "lucifer",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.errorMessage = req.flash("error")?.length ? req.flash("error")[0] : null;
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((result) => {
    // User.findOne().then((user) => {
    //   console.log("11", user);
    //   if (!user) {
    //     const user = new User({
    //       name: "adriel",
    //       email: "adrielwerlich@outlook.com",
    //       password: "lucifer",
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user
    //       .save()
    //       .then((savedUser) => {
    //         console.log("22", savedUser);
    //       })
    //       .catch((err) => console.log(err));
    //   }
    // });
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
