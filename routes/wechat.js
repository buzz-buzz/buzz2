module.exports = function (app, router, render) {
    router
    ///wechat/oauth/callback?is_registed=true&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZW1iZXJfaWQiOiIwMzFiM2RmMi0xMjQ3LTRmM2EtYTUzMi1iZTU5N2RkYzAwNTIiLCJleHBpcmUiOjE0ODc0MTMyNDY5MDN9.FHdkr5vivj5rLOZQtmSbD-GwsNI8vLzBwDmo7nTHRss&openid=%20oE4jFt9jNGNrlvLbCS3eOy3w27qs
        .get('/wechat/oauth/callback', function () {
            this.body = this.query;
        })
    ;
};