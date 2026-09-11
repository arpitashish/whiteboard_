const mongoose = require("mongoose");

const canvasSchema = new mongoose.Schema({
    elements: [{ type: mongoose.Schema.Types.Mixed }],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Canvas", canvasSchema);