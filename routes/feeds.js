"use strict";

const express = require("express"),
  router = express.Router(),
  controller = require("../controllers/feeds");

// GET
router.get("/", controller.list);
router.get("/:id", controller.get);
router.get("/:id/test", controller.test);
router.get("/:id/raw", controller.raw);
router.get("/:id/table", controller.test);
router.get("/:id/columns", controller.columns);
router.get("/:id/rules", controller.rules);

router.delete("/:id", controller.delete);

router.put("/:id", controller.update);
router.post("/", controller.create);
module.exports = router;
