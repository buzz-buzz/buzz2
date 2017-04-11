/**
 * Created by hank on 2017/4/10.
 */
'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const proxy = require('./proxy');
const membership = require('../membership');


module.exports = function (app, router, parse) {
    router
        .get('/vocabulary',  membership.ensureAuthenticated, function *() {
            var name=this.query.name;
            var rf=require("fs");
            var data=rf.readFileSync("../buzz/mock/"+name+"/index.json","utf-8");
            this.body=data;
        })
    ;
};