"use strict";

const express = require("express"),
  router = express.Router(),
  controller = require("../controllers/feeds");

// GET
router.get("/", controller.list);
router.get("/:id", controller.get);
router.delete("/:id", controller.delete);
router.put("/:id", controller.update);
router.post("/", controller.create);
module.exports = router;
