/**
 * Created by hank on 2017/4/6.
 */
'use strict';

const config = require('../config');
const serviceUrls = config.serviceUrls;
const proxy = require('./proxy');
const membership = require('../membership');

const proxyOption = {
    host: config.progress.inner.host,
    port: config.progress.inner.port,
};

module.exports = function (app, router, parse) {
    router
        .get(serviceUrls.buzz.progress.statistics.frontEnd,membership.ensureAuthenticated,function *(){
            this.body = yield proxy(Object.assign({
                path: serviceUrls.buzz.progress.statistics.upstream + '?' +'$filter=member_id%20eq%20%27'+this.state.hcd_user.member_id+'%27%20and%20level%20eq%20%27'+this.query.level+'%27&$select=week,week_start_at,week_end_at,num_of_correct_word,num_of_all_correct_question_day,num_of_incorrect_question_day,rank&$top='+this.query.top,
                method: 'GET'
            }, proxyOption));
        })
    ;
};