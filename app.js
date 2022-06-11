const express = require("express");
const passport = require("passport");
const { spawn } = require("child_process");
const path = require("path");
const app = express();
const cron = require("node-cron");
// Passport Config
require("./config/passport")(passport);
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
app.set("view engine", "ejs");
const flash = require("connect-flash");
const session = require("express-session");

// Static Folders
app.use(express.static("public"));

// BodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Express Session
app.use(
  session({
    secret: "mmbkjmgstel 56756245ff kgjlo[few@75449.clhl.d",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

require("./routes")(app);

// mongodb+srv://admin:admin123456@cluster0.04rgz.mongodb.net/images?retryWrites=true&w=majority
// mongodb://localhost:27017/sell_goods
mongoose
  .connect("mongodb://localhost:27017/sell_goods")
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err));

// handle data backup
// mongodump --db=sell_goods --archive=./sell_goods.gzip --gzip

// restore command
// mongorestore --db=sell_goods --archive=./public/backup/sell_goods.gzip --gzip

const DB_NAME = "sell_goods";
const ARCHIVE_PATH = path.join(
  __dirname,
  "public",
  "backup",
  `${DB_NAME}.gzip`
);

cron.schedule("0 0 * * *", () => backupMongodb());

function backupMongodb() {
  const child = spawn("mongodump", [
    `--db=${DB_NAME}`,
    `--archive=${ARCHIVE_PATH}`,
    "--gzip",
  ]);

  child.stdout.on("data", (data) => {
    console.log("stdout:\n", data);
  });
  child.stderr.on("data", (data) => {
    console.log("stderr:\n", data);
  });

  child.on("error", (error) => {
    console.log(`error:\n`, error);
  });

  child.on("exit", (code, signal) => {
    if (code) console.log("Process exit with code:", code);
    else if (signal) console.log("Process killed with signal:", signal);
    else console.log("Backup is successfull ✅");
  });
}

// handle data backup

// Server
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
