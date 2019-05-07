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
};
