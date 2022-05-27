const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
app.use(express.json());
app.set("view engine", "ejs");

// Static Folders
app.use(express.static("public"));

app.use(require("./routes/router"));

mongoose
  .connect(
    "mongodb+srv://admin:admin123456@cluster0.04rgz.mongodb.net/images?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));
