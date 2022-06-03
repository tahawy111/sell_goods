module.exports = (app) => {
  app.use(require("./productRoute"));
  app.use(require("./authRoute"));
  app.use(require("./cartRoute"));
};
