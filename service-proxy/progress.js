/**
 * Created by hank on 2017/4/6.
 */
'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const qs = require('querystring');
const proxy = require('./proxy');

const proxyOption = {
    host: config.progress.inner.host,
    port: config.progress.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get(serviceUrls.buzz.progress.Statistics.frontEnd,function *(){
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.progress.Statistics.upstream + '?' + '?$filter=member_id%20eq%20%27a%27%20and%20level%20eq%20%27A%27&$select=week,week_start_at,week_end_at,num_of_correct_word,num_of_all_correct_day,num_of_incorrect_day,rank&$top=1',
                method: 'GET',
            }, proxyOption));
        })
    ;
};