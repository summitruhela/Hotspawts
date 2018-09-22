var async = require('async');

var arr = [1, 2, 3, 4];

async.eachSeries(arr, function (item, cb) {
    setTimeout(function () {
        console.log('#1: ', item);
        return cb();
    }, Math.random() * 2000);
}, function (err) {
    console.log('#1 Final call ', err);
});

console.log('#1 should print first');

async.eachSeries(arr, function (item, cb) {
    setTimeout(function () {
        console.log('#2: ', item);
        return cb();
    }, Math.random() * 2000);
}, function (err) {
    console.log('#2 Final call ', err);
});

console.log('#2 should print second');
