const express = require("express");
const passport = require("passport");
const { spawn } = require("child_process");
const path = require("path");
const app = express();
const cron = require("node-cron");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const AdminModel = require("./models/AdminModel");

// Passport Config
require("./config/passport")(passport);

const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");

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

// Routes
require("./routes")(app);

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/sell_goods")
  .then(async () => {
    console.log("✅ DB Connected");

    // Create admin if not exists
    await createAdminIfNotExists();

    // Start the server AFTER ensuring admin creation
    app.listen(PORT, () =>
      console.log(`🚀 App listening at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));

// Auto-create default admin if not found
async function createAdminIfNotExists() {
  const existingAdmin = await AdminModel.findOne({ username: "admin" });

  if (!existingAdmin) {
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const newAdmin = new AdminModel({
      name: "Default Admin",
      username: "admin",
      password: hashedPassword,
      comment: "Auto-generated admin",
      manageAdmins: true,
    });

    await newAdmin.save();
    console.log("🛡️ Default admin created: admin / admin123");
  } else {
    console.log("ℹ️ Admin already exists.");
  }
}

// MongoDB Backup Setup
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
    console.log("stdout:\n", data.toString());
  });
  child.stderr.on("data", (data) => {
    console.error("stderr:\n", data.toString());
  });
  child.on("exit", (code) => {
    if (code === 0) {
      console.log("✅ Backup completed successfully.");
    } else {
      console.error(`❌ Backup process exited with code: ${code}`);
    }
  });
}
