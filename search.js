// GET route  route at "/search" that expects a query parameter "q" (for the search query).
// uses this query to search the database for matching articles and returns the results as JSON.
const express = require('express');
const router = express.Router();
const Article = require('./models/Article'); // assuming you have an Article model

router.get('/search', async (req, res) => {
    const query = req.query.q;
    const articles = await Article.find({ $text: { $search: query } });
    res.json(articles);
});

module.exports = router;

// tect index for title and content fields in the article model
// allows us to use the $text and $search operators to search these fields.
const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    date: Date
});

ArticleSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Article', ArticleSchema);

//  sends a GET request to the "/search" route with the user's search query as a parameter.
// It then converts the response to JSON (which should be an array of matching articles) and calls another function to display the results.
async function searchArticles(query) {
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const articles = await response.json();

    displaySearchResults(articles); // display the results on the page
}

// error handling
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const articles = await Article.find({ $text: { $search: query } });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// rate limiting
const rateLimit = require("express-rate-limit");

const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

router.get('/search', searchLimiter, async (req, res) => {
    // search code...
});

// prevent XSS attacks
const DOMPurify = createDOMPurify(window);
const clean = DOMPurify.sanitize(dirty);
