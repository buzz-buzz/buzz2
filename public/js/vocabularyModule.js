angular.module('vocabularyModule', ['trackingModule'])
    .controller('vocabularyCtrl', ['$scope', '$sce', 'tracking', function ($scope, $sce, tracking) {
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
        //Mock data
        var a0 = function (a) {
            if (a > 0.6) {
                return RADIO_TYPE.PASS;
            } else if (a > 0.3) {
                return RADIO_TYPE.FAIL;
            } else {
                return RADIO_TYPE.NOTTEST;
            }
        };
        var a1 = function () {
            return {
                name: "pumpkin",
                ipc: "[ˈpʌmpkɪn]",
                explaination: "解释",
                soundURL: "",
            };
        };
        var a2 = function () {
            return {
                name: "hair",
                ipc: "[ˈpʌmpkɪn]",
                explaination: "解释",
                soundURL: "",
            };
        };
        $scope.vocabularyAll = [
            {
                year: 2016,
                monthDay: "Oct.21th",
                words: []
            },
            {
                year: 2016,
                monthDay: "Oct.20th",
                words: []
            },
            {
                year: 2015,
                monthDay: "Oct.21th",
                words: []
            }
        ];
        for (var i = 0; i < 3; i++) {
            var b = Math.ceil(Math.random() * 10);
            for (var j = 0; j < b; j++) {
                var c = Math.random();
                $scope.vocabularyAll[i].words.push(Math.random() > 0.5 ? a1() : a2());
                $scope.vocabularyAll[i].words[j].status = a0(c);
            }
        }
        $scope.vocabularyAll.forEach(function (value) {
            value.words.forEach(function (word) {
                wordsToPrint[RADIO_TYPE.NONE].push(word.name);
                wordsToPrint[word.status].push(word.name);
            });
        });
    }]);