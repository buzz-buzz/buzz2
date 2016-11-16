angular.module('signInModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule'])
    .controller('signInCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', function ($scope, clientConfig, service, queryParser) {
        $scope.signInData = {
            account: '',
            password: ''
        };

        $scope.signIn = function () {
            service.post(clientConfig.serviceUrls.sso.signIn.frontEnd, {
                value: $scope.signInData.account,
                password: $scope.signInData.password,
                return_url: queryParser.get('return_url')
            }).then(function (result) {
                console.log(result);
            });
        };
    }])
;