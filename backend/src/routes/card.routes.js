const express = require("express");
const { verifyToken } = require("../middleware/auth");
const {
  listSavedCards,
  saveCard,
  deleteCard,
} = require("../controllers/card.controller");

const router = express.Router();

router.use(verifyToken);

router.get("/", listSavedCards);
router.post("/", saveCard);
router.delete("/:id", deleteCard);

module.exports = router;
