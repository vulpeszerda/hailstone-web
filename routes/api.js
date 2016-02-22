var express = require('express');
var request = require('request');
var router = express.Router();

var proxyHost = 'http://staging.hailstone.io:3800';

router.all('*', function(req, res, next) {
    var path = req.params[0];
    var proxyUrl = proxyHost + path;
    if (req.query) {
        var name = req.query.name;
        var idx = req.query.idx;
        var q = [];
        if (name) {
            q.push('name=' + name);
        }
        if (idx) {
            q.push('idx=' + idx);
        }
        if (q.length > 0) {
            proxyUrl += '?' + q.join('&');
        }
    }

    console.log(proxyUrl);
    try {
        req.pipe(request(proxyUrl)).pipe(res);
    } catch (e) {
        res.statusCode = 400;
        res.send({
            success: false
        });
    }
});

module.exports = router;
