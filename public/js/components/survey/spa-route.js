angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/survey', {
                templateUrl: 'survey.html',
                controller: 'surveyCtrl',
                controllerAs: 'surveyCtrl'
            })
            .when('/agreement', {
                templateUrl: 'agreement.html',
                controller: 'surveyCtrl',
                controllerAs: 'surveyCtrl'
            })
            .when('/survey/help-friend/:short_id/:friend_member_id', {
                templateUrl: 'help-friend.html',
                controller: 'helpFriendCtrl',
                controllerAs: 'helpFriendCtrl'
            });

        $routeProvider.otherwise('/survey');
    }])
    .controller('surveyCtrl', ['$scope', '$rootScope', '$http', '$timeout', function ($scope, $rootScope, $http, $timeout) {}])
    .controller('surveyShareCtrl', ['$scope', '$rootScope', '$http', 'clientConfig', '$timeout', function ($scope, $rootScope, $http, clientConfig, $timeout) {
        var strCookie = document.cookie;
        var arrCookie = strCookie.split(";");
        var member_id;
        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if ("mid" == arr[0]) {
                member_id = arr[1];
                break;
            }
        }

        var short_id = /\??short_id=(\w+)/.exec(location.search)[1];

        var sharable = {
            title: '孩子一个月看懂全球英语资讯？这不是痴人说梦',
            desc: '用一顿肯德基的钱，助力孩子实现一个梦想',
            link: location.origin + '/survey/help-friend/' + short_id + '/' + member_id,
            imgUrl: '//resource.buzzbuzzenglish.com/wechat-share-friend.jpg'
        };

        $rootScope.wechatSharable = sharable;

        $http.get(clientConfig.serviceUrls.wechat.sign.frontEnd, {
            params: {
                url: encodeURIComponent(location.href)
            }
        }).then(function (result) {
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: result.data.appId, // 必填，公众号的唯一标识
                timestamp: result.data.timestamp, // 必填，生成签名的时间戳
                nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
                signature: result.data.signature, // 必填，签名，见附录1
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });

            function shareToTimelineSuccess(result) {
                if (result.errMsg === 'shareTimeline:ok') {

                } else {

                }
            }

            function shareToTimelineCancel(result) {
                if (result.errMsg === 'shareTimeline:cancel') {

                } else {

                }
            }

            function shareToFriendSuccess(result) {
                if (result.errMsg === 'sendAppMessage:ok') {

                } else {

                }
            }

            function shareToFriendCancel(result) {
                if (result.errMsg === 'sendAppMessage:cancel') {

                } else {}
            }

            wx.ready(function () {
                wx.onMenuShareTimeline(angular.extend({}, sharable, {
                    success: shareToTimelineSuccess,
                    cancel: shareToTimelineCancel,
                    title: sharable.title + ' ' + sharable.desc
                }));

                wx.onMenuShareAppMessage(angular.extend({}, sharable, {
                    success: shareToFriendSuccess,
                    cancel: shareToFriendCancel,
                    title: sharable.title
                }));

                $rootScope.$emit('wx:ready', sharable);
                wx.isReady = true;
            });

            wx.error(function (res) {
                console.error(res);
            });
        });

        $timeout(function () {
            $('#dimmer')
                .dimmer('show');
        }, 2000);

        $scope.closeDimmer = function () {
            $('#dimmer')
                .dimmer('hide');
        };
    }])
    .controller('helpFriendCtrl', ['$scope', '$http', '$routeParams', '$timeout', function ($scope, $http, $routeParams, $timeout) {
        $scope.support = function () {
            $timeout(function () {
                supportFriend();
            }, 2000);
        };

        function gotoSurveyPage() {
            var timestamp=(new Date()).getTime();
            location.href = '/survey?short_id=' + $routeParams.short_id + '&time=' +timestamp;
        }

        function supportFriend() {
            $http.put('/service-proxy/surveys/help-friend/i-support', {
                short_id: $routeParams.short_id,
                friend_member_id: $routeParams.friend_member_id
            }).then(function (res) {
                gotoSurveyPage();
            });
        }

        $scope.giveUp = function () {
            gotoSurveyPage();
        };
    }]);