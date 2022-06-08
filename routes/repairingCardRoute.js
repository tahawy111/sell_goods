const express = require("express");
const router = express.Router();
const RepairingCardModel = require("../models/RepairingCardModel");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

router.get(
  "/repaingCard/add-repairing-card",
  ensureAuthenticated,
  (req, res) => {
    let totalProducts = null;

    if (!req.user.cart) {
      totalProducts = "";
    } else {
      totalProducts = req.user.cart.totalQuantity;
    }

    res.render("add-repairing-card", {
      title: "Add Repairing Card",
      totalProducts,
      admin: req.user,
    });
  }
);

router.post(
  "/repaingCard/add-repairing-card",
  ensureAuthenticated,
  (req, res) => {
    let totalProducts = null;

    if (!req.user.cart) {
      totalProducts = "";
    } else {
      totalProducts = req.user.cart.totalQuantity;
    }
    const card = new RepairingCardModel(req.body);

    card
      .save()
      .then((result) => {
        res.render("success-page", {
          title: "تم اضافة كرت الصيانة",
          admin: req.user,
          success_title: "تم اضافة كرت الصيانة",
          btn_title: "طباعة",
          btn_url: `/repaingCard/print/${result._id}`,
          target: "_blank",
          totalProducts,
        });
      })
      .catch((err) => console.log(err));
  }
);

router.get("/repairing-card-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  RepairingCardModel.find()
    .then((result) => {
      res.render("repairing-card-list", {
        title: "قائمة كروت الصيانة",
        totalProducts,
        admin: req.user,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.get(
  "/repaingCard/edit-repairing-card/:id",
  ensureAuthenticated,
  (req, res) => {
    let totalProducts = null;

    if (!req.user.cart) {
      totalProducts = "";
    } else {
      totalProducts = req.user.cart.totalQuantity;
    }

    RepairingCardModel.findById(req.params.id).then((result) => {
      res.render("edit-repairing-card", {
        title: "تعديل كرت الصيانة",
        totalProducts,
        admin: req.user,
        data: result,
      });
    });
  }
);
router.get(
  "/repaingCard/delete-repairing-card/:id",
  ensureAuthenticated,
  (req, res) => {
    RepairingCardModel.findByIdAndRemove(req.params.id)
      .then((result) => {
        res.redirect("/repairing-card-list");
      })
      .catch((err) => console.log(err));
  }
);

router.get(
  "/repaingCard/edit-repairing-card/:id",
  ensureAuthenticated,
  (req, res) => {
    let totalProducts = null;

    if (!req.user.cart) {
      totalProducts = "";
    } else {
      totalProducts = req.user.cart.totalQuantity;
    }

    RepairingCardModel.findById(req.params.id).then((result) => {
      res.render("edit-repairing-card", {
        title: "تعديل كرت الصيانة",
        totalProducts,
        admin: req.user,
        data: result,
      });
    });
  }
);
router.get("/repaingCard/print/:id", ensureAuthenticated, (req, res) => {
  RepairingCardModel.findById(req.params.id).then((result) => {
    res.render("print-card-page", {
      data: result,
    });
  });
});

router.post(
  "/repaingCard/edit-repairing-card/:id",
  ensureAuthenticated,
  (req, res) => {
    if (req.body.state === undefined) {
      req.body.state = false;
    } else {
      req.body.state = true;
    }

    let totalProducts = null;

    if (!req.user.cart) {
      totalProducts = "";
    } else {
      totalProducts = req.user.cart.totalQuantity;
    }

    RepairingCardModel.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      damageName: req.body.damageName,
      phoneNumber: req.body.phoneNumber,
      state: req.body.state,
    })
      .then((result) => {
        res.redirect("/repairing-card-list");
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
