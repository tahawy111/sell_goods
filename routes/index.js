module.exports = (app) => {
  app.use(require("./productRoute"));
  app.use(require("./authRoute"));
  app.use(require("./cartRoute"));
  app.use(require("./billRoute"));
  app.use(require("./repairingCardRoute"));
  app.use(require("./userDealerRoute"));
};
