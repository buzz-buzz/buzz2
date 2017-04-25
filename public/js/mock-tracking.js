angular.module('trackingModule', [])
    .factory('tracking', [function () {
        var tracking = {
            send: function () {
            },
            sendX: function () {
            }
        };
        window.tracking = {
            send: function () {
            },
            sendX: function () {
            }
        };
        return tracking;
    }])
;