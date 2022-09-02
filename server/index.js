require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Board = require('./models/board');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const { PORT, MONGO_URI } = process.env;

let corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors(corsOptions));

mongoose
    .connect(MONGO_URI, {   
        useNewUrlParser: true,
    })
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.log(e));

// routes
app.post("/save", async(req, res) => {
    const board = new Board(req.body);
    try {
        await board.save();
        res.status(200).send({message: "success"});
    } catch(e) {
        res.status(500).json({
            message: "Board 저장 실패"
        });
    }
});

/**
 *  GET /list 전체 게시물 조회
 */
app.get("/list", async(req, res) => {
    try {
        const boards = await Board.find({});
        res.status(200).send(boards);
    } catch(e) {
        res.status(500).json({
            message: "Board 조회 실패"
        });
    }
});

/**
 *  GET /detail/:id 특정 게시물 조회
 */
app.get("/detail/:id", async(req, res) => {
    const id = req.params.id;
    try {
        const board = await Board.findOne({boardid: id});

        if(!board) {
            return res.status(404).send();
        }
        res.status(200).send(board);
    } catch(e) {
        res.status(500).json({
            message: "Board 조회 실패",
        });
    }
});

/**
 * POST /edit/:id 특정 게시물 특정 필드 변경
 */
app.post("/edit/:id", async(req, res) => {
    const id = req.params.id;

    try {
        const board = await Board.updateOne({boardid: id}, {$set: {title: req.body.title, content: req.body.content}});

        if(!board) {
            return res.status(404).send();
        }
        res.status(200).send(board);
    } catch(e) {
        res.status(500).json({
            message: "Board 변경 실패"
        });
    }
});

/**
 * DELETE /boards/:id 특정 게시물 제거
 */
app.delete("/delete/:id", async(req, res) => {
    const id = req.params.id;

    try {
        const board = await Board.deleteOne({boardid: id});

        if(!board) {
            return res.status(404).send();
        }
        res.status(200).send(board);
    } catch(e) {
        res.status(500).json({
            message: "Board 삭제 실패",
        });
    }
});

module.exports = (app) => {
    app.use(
      createProxyMiddleware('/', {
        target: 'http://localhost:8000',
        changeOrigin: true,
      })  
    );
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));