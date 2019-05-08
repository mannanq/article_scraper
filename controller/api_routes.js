const express = require('express'),
    logger = require('morgan'),
    mongoose = require('mongoose');

const axios = require('axios');
const cheerio = require('cheerio');

const db = require('../model/index');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index');
    });

    app.get('/scrape', function(req, res) {
        axios
            .get('https://www.theonion.com/c/news-in-brief')
            .then(function(response) {
                var $ = cheerio.load(response.data);

                $(
                    'article div.item__content div.item__text h1.headline a'
                ).each(function(i, element) {
                    console.log(
                        $(this)
                            .children()
                            .text()
                    );
                    console.log($(this).attr('href'));

                    let result = {};
                    result.title = $(this)
                        .children()
                        .text();
                    result.link = $(this).attr('href');
                    db.Article.create(result)
                        .then(function(dbArticle) {
                            // show the result in console
                            console.log(dbArticle);
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                });
                // on completing, send this message in the browser
                res.send('Scrape Complete');
            });
    });

    // get articles from the database
    app.get('/articles', function(req, res) {
        db.Article.find({})
            .then(function(dbArticle) {
                res.json(dbArticle);
            })
            .catch(function(err) {
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get('/articles/:id', function(req, res) {
        db.Article.findOne({ _id: req.params.id })
            .populate('note')
            .then(function(dbArticle) {
                res.json(dbArticle);
            })
            .catch(function(err) {
                res.json(err);
            });
    });

    // post route for updating an article's note
    app.post('/articles/:id', function(req, res) {
        db.Note.create(req.body)
            .then(function(dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate(
                    { _id: req.params.id },
                    { note: dbNote._id },
                    { new: true }
                );
            })
            .then(function(dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });
};
