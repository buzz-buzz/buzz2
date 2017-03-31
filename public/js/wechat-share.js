angular.module('wechatShareModule', ['clientConfigModule', 'buzzHeaderModule'])
    .run(['$rootScope', '$http', 'clientConfig', function ($rootScope, $http, clientConfig) {
        var index = location.href.indexOf('#')
        if (index < 0) {
            index = undefined;
        }

        function getDesc(who) {
            return who + ' 邀请您一起看今日Buzzbuzz青少年英语新闻';
        }

        var who = '你的朋友';
        $rootScope.$watch('profile', function (newValue) {
            if (newValue) {
                who = newValue.displayName;
                sharable.desc = getDesc(who);
            }
        });

        var sharable = {
            title: 'Buzzbuzz English',
            desc: getDesc(who),
            link: location.href,
            imgUrl: 'http://resource.buzzbuzzenglish.com/image2.jpg'
        };

        $http.get(clientConfig.serviceUrls.wechat.sign.frontEnd, {
            params: {
                url: location.href.substr(0, index)
            }
        }).then(function (result) {
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: result.data.appId, // 必填，公众号的唯一标识
                timestamp: result.data.timestamp, // 必填，生成签名的时间戳
                nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
                signature: result.data.signature,// 必填，签名，见附录1
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

                } else {
                }
            }

            wx.ready(function () {
                wx.onMenuShareTimeline(angular.extend(sharable, {
                    success: shareToTimelineSuccess,
                    cancel: shareToTimelineCancel,
                    title: sharable.desc
                }));
                wx.onMenuShareAppMessage(angular.extend(sharable, {
                    success: shareToFriendSuccess,
                    cancel: shareToFriendCancel
                }));
            });

            wx.error(function (res) {
                console.error(res);
            })
        });

    }])
;