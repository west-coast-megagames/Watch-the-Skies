const { getTimeRemaining } = require('../../wts/gameClock/gameClock')

const routeDebugger = require('debug')('app:routes');
const express = require('express');

const router = express.Router();

const nexusEvent = require('../../startup/events')

// Article Model - Using Mongoose Model
const { Article, validateArticle } = require('../../models/news/article');
const { Team } = require('../../models/team/team');
const { Site } = require('../../models/sites/site');

// @route   GET api/news/gnn
// @Desc    Get all Articles from GNN
// @access  Public
router.get('/gnn', async function (req, res) {
    routeDebugger('Gathering all articles by GNN!');
    let articles = await Article.find({ agency: 'GNN' });
    res.json(articles);
});

// @route   GET api/news/bnc
// @Desc    Get all Articles from BNC
// @access  Public
router.get('/bnc', async function (req, res) {
    routeDebugger('Gathering all articles by BNC!');
    let articles = await Article.find({ agency: 'BNC' });
    res.json(articles);
});

// @route   GET api/news/articles
// @Desc    Get all Articles
// @access  Public
router.get('/articles', async function (req, res) {
    routeDebugger('Gathering all articles!');
    let articles = await Article.find();
    res.json(articles);
});

// @route   POST api/news
// @Desc    Post a new article
// @access  Public
router.post('/', async function (req, res) {
    let { publisher, location, headline, body, tags, imageSrc } = req.body; // REQ Destructure
    // const { error } = validateArticle(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    let team = await Team.findOne({_id: publisher}) // MONGOOSE - Finds team DOC for publisher
    console.log(team)
    console.log(`${team.name} is submitting...`)

    let gameTime = getTimeRemaining(); // Gets current game clock time

    // Create timestamp for article
    let timestamp = {
        turn: gameTime.turn,
        phase: gameTime.phase,
        turnNum: gameTime.turnNum,
        clock: `${gameTime.minutes}:${gameTime.seconds}`
    }
    
    let article = new Article({
        publisher,
        agency: team.teamCode,
        timestamp,
        location,
        headline,
        articleBody: body,
        date: Date.now(),
        tags,
        imageSrc
    });

    article = await article.save();
        console.log(`Article posted by ${team.name}...`);
        console.log(article)
        nexusEvent.emit('newsAlert', article);
        return res.json(article);     
});

// @route   PUT api/news/:id
// @Desc    Update an article
// @access  Public
router.put('/:id', async function (req, res) {
    let { agency, turn, date, location, headline, body, imageSrc } = req.body;
    const article = await Article.findOneAndUpdate({ _id: req.params.id }, { agency, turn, date, location, headline, body, imageSrc }, { new: true });
    res.json(article);
    routeDebugger(`Article: ${headline} updated...`);
});

// @route   DELETE api/news/:id
// @Desc    Delete an article
// @access  Public
router.delete('/:id', async function (req, res) {
    let id = req.params.id;
    const article = await Article.findByIdAndRemove(id);
    if (article != null) {
        routeDebugger(`${article.headline} with the id ${id} was deleted!`);
        res.status(200).send(`${article.headline} with the id ${id} was deleted!`);
    } else {
        res.status(400).send(`No article with the id ${id} exists!`);
    }
});

router.delete('/', async function (req, res) {
    let id = req.body._id;
    const article = await Article.findByIdAndRemove(id);
    console.log(article);
    if (article != null) {
        routeDebugger(`${article.headline} with the id ${id} was deleted!`);
        res.status(200).send(article);
    } else {
        res.status(400).send(`No article with the id ${id} exists!`);
    }
});

module.exports = router;