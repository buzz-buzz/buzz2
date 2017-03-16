angular.module('serviceCacheModule', ['clientConfigModule'])
    .factory('cache', ['$q', function ($q) {
        var cache = {};

        return {
            get: function (key) {
                var result = cache[key];

                if (result) {
                    return $q.resolve(result);
                } else {
                    return $q.reject();
                }
            },

            set: function (key, value) {
                cache[key] = value;
                return $q.resolve();
            },

            all: function () {
                return cache;
            }
        };
    }])
    .factory('api', ['$http', 'clientConfig', 'cache', function ($http, clientConfig, cache) {
        function getApiResult(method, url, data) {
            var key = url + '$' + (data ? JSON.stringify(data) : '');

            return cache.get(key)
                .catch(function (ex) {
                    return $http[method](url, data).then(function (result) {
                        cache.set(key, result);

                        return result;
                    });
                })
                ;
        }

        var api = {};

        ['get', 'post', 'put', 'delete'].map(function (m) {
            api[m] = function (url, data) {
                return getApiResult(m, url, data);
            };
        });

        return api;
    }])
;