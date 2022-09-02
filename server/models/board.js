const mongoose = require('mongoose');

// 스키마 생성
const boardSchema = new mongoose.Schema({
    boardid: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    saveDt: { type: Date, default: Date.now, }
}, { timestamps: true });

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;