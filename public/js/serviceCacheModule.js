;
(function () {
    angular.module('serviceCacheModule', ['clientConfigModule', 'serviceCacheCoreModule'])
        .factory('buzzApi', ['api', 'clientConfig', function (api, clientConfig) {
            return {
                getMyShareLink: function (invite_code) {
                    return api.get(clientConfig.serviceUrls.buzz.share.myLink, {
                        params: {
                            invite_code: invite_code
                        }
                    }).then(function (result) {
                        return location.origin + result.data;
                    });
                },
                getMySharingQrCode: function (invite_code, size) {
                    return this.getMyShareLink(invite_code).then(function (link) {
                        return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + '&data=' + link;
                    });
                },
                getShareLink: function (invite_code, channel) {
                    return api.get(clientConfig.serviceUrls.buzz.share.Link, {
                        params: {
                            invite_code: invite_code,
                            channel: channel
                        }
                    }).then(function (result) {
                        return location.origin + result.data;
                    });
                },
            };
        }])
        ;
})();