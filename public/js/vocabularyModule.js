angular.module('vocabularyModule', ['trackingModule', 'clientConfigModule', 'DateModule'])
    .controller('vocabularyCtrl', ['$scope', '$sce', 'tracking', 'clientConfig', '$http', 'Month', 'DateOfMonth', function ($scope, $sce, tracking, clientConfig, $http, Month, DateOfMonth) {
        tracking.send('myVocabulary');

        $scope.printMode = false;
        $scope.printURL = "";
        var RADIO_TYPE = $scope.RADIO_TYPE = {
            "NONE": "none",
            "PASS": "pass",
            "FAIL": "fail",
            "NOTTEST": "nottest"
        };
        $scope.radioBoxType = RADIO_TYPE.NONE;
        $scope.$sce = $sce;
        var PRINT_URL_PREFIX = "/vocabulary/print?";
        var wordsToPrint = {
            "pass": [],
            "fail": [],
            "nottest": [],
            "none": []
        };
        $scope.vocabularyPrint = function () {
            tracking.send('myVocabulary.printBtn.click');
            $scope.printMode = true;
            var content = encodeURIComponent(wordsToPrint[$scope.radioBoxType].slice(","));
            $scope.printURL = PRINT_URL_PREFIX + content;
        };
        $scope.hidePopup = function () {
            $scope.printMode = false;
            $scope.printURL = "";
        };
        $scope.checkboxClick = function (type) {
            var event;

            switch (type) {
                case RADIO_TYPE.FAIL:
                    event = 'myVocabulary.notUnderstoodBtn.click';
                    break;
                case RADIO_TYPE.PASS:
                    event = 'myVocabulary.understoodBtn.click';
                    break;
                case RADIO_TYPE.NOTTEST:
                    event = 'myVocabulary.notPracticeBtn.click';
                    break;
                default:
                    break;
            }

            if (type === $scope.radioBoxType) {
                $scope.radioBoxType = RADIO_TYPE.NONE;
                tracking.send(event, {
                    checked: false
                });
            } else {
                $scope.radioBoxType = type;
                tracking.send(event, {
                    checked: true
                });
            }
        };
        $scope.vocabularyAll = [];

        //
        // $scope.vocabularyAll.forEach(function (value) {
        //     value.words.forEach(function (word) {
        //         wordsToPrint[RADIO_TYPE.NONE].push(word.name);
        //         wordsToPrint[word.status].push(word.name);
        //     });
        // });

        $http.get(clientConfig.serviceUrls.buzz.courses.findByLevel.frontEnd.replace(':level', 'A'))
            .then(function (result) {
                $scope.vocabularyAll = [];
                result.data.map(function (course) {
                    var date = new Date(course.date);

                    $scope.vocabularyAll.push({
                        year: date.getFullYear(),
                        monthDay: Month[date.getMonth()] + '.' + DateOfMonth.getShortString(date.getDate()),
                        words: []
                    });

                    (function (v) {
                        $http.get(course.new_words_path).then(function (result) {
                            for (var word in result.data.dictionary) {
                                v.words.push({
                                    name: word,
                                    index: result.data.dictionary[word].id,
                                    ipc: result.data.dictionary[word].ipc,
                                    explaination: result.data.dictionary[word].explanation,
                                    soundURL: result.data.dictionary[word].ipa,
                                    url: result.data.dictionary[word].url,
                                    exercise: result.data.dictionary[word].exercise
                                });
                            }

                            v.words.sort(function (x, y) {
                                var diff = x.index - y.index;

                                if (diff > 0) return 1;
                                if (diff < 0) return -1;
                                return 0;
                            });
                        });
                    })($scope.vocabularyAll[$scope.vocabularyAll.length - 1]);
                });
            })
        ;
    }]);