const express = require("express");

const {
  createCanvas,
  updateCanvas,
  loadCanvas,
  deleteCanvas,
  getUserCanvases,
} = require("../controllers/canvasController");

const router = express.Router();

router.post("/create", createCanvas);

router.put("/update", updateCanvas);

router.get("/load/:id", loadCanvas);

router.delete("/delete/:id", deleteCanvas);

router.get("/list", getUserCanvases);

module.exports = router;