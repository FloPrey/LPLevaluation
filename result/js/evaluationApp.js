/**
 * Created by flo on 25.04.17.
 */
var evalApp = angular.module('lplResult', ['ngRoute', 'ui.bootstrap', 'googlechart', 'ngSanitize', 'ngCsv']);

evalApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'view/evaluation1.html',
            controller: 'eval1Ctrl'
        }).when('/evalOne', {
            templateUrl: 'view/evaluation1.html',
            controller: 'eval1Ctrl'
        }).when('/evalTwo', {
            templateUrl: 'view/evaluation2.html',
            controller: 'eval2Ctrl'
        }).when('/evalThree', {
            templateUrl: 'view/evaluation3.html',
            controller: 'eval3Ctrl'
        }).when('/evalFour', {
            templateUrl: 'view/evaluation4.html',
            controller: 'eval4Ctrl'
        });
    $locationProvider.hashPrefix('');
});

evalApp.controller('appCtrl', function($scope, $rootScope, $http) {
    $http.get('loadJson.php').then(function (response) {
        $rootScope.fullJson = response.data;
    });
});

evalApp.controller('eval1Ctrl', function ($scope, $rootScope, $http, googleChartApiPromise) {
    $scope.loading = true;
    $rootScope.$watch('fullJson', function () {
        $scope.results = [];
        if($rootScope.fullJson != undefined) {
            angular.forEach($rootScope.fullJson.eval1, function (value, key) {
                $http.get('../data/' + value).then(function (response) {
                    $scope.results.push(response.data);
                    if (key == $rootScope.fullJson.eval1.length - 1) {
                        $scope.jsonLoaded();
                    }
                });
            });
        }
    });

    function loadingFinished() {
        $scope.loading = false;
    }

    function createRandomColor() {
        var number = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += number[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    $scope.filter = {gender: ['männlich', 'weiblich', 'keine Angabe'],
        age: ['10 - 18 Jahre','18 - 30 Jahre','30 - 40 Jahre','40 - 50 Jahre','50 - 60 Jahre','60 jahre und älter'],
        job: ['schueler', 'student', 'angestellter', 'selbstständig', 'rentner', 'hausfrau', 'freiberufler', 'beamte',
        'nicht-erwerbsfähig', 'auszubildend', 'keine-angabe'],
        internet: ['täglich', '4-6 mal', '2-3 mal', '1 mal', 'seltener', 'Keine Angabe']};
    $scope.avFilter =  {};
    angular.copy($scope.filter, $scope.avFilter);

    $scope.toggleFilter = function (type, value) {
        $scope.loading = true;
        var index = $scope.filter[type].indexOf(value);
        if(index > -1) {
            $scope.filter[type].splice(index, 1);
        } else {
            $scope.filter[type].push(value);
        }
        $scope.jsonLoaded();
    };

    $scope.jsonLoaded = function () {
        $scope.sex = {};
        $scope.internet = {};
        $scope.jobs = {};
        $scope.age = {};
        $scope.dTime1 = 0;
        $scope.dTime2 = 0;
        $scope.dTime3 = 0;
        $scope.questionChart = [];
        angular.forEach($scope.results, function (value) {
            if($scope.filter.gender.indexOf(value.personal.gender) > -1
                && $scope.filter.internet.indexOf(value.personal.internet) > -1
                && $scope.filter.job.indexOf(value.personal.job.val) > -1
                && $scope.filter.age.indexOf(value.personal.age) > -1) {
                $scope.sex.hasOwnProperty(value.personal.gender) ? $scope.sex[value.personal.gender]++ : $scope.sex[value.personal.gender] = 1;
                $scope.internet.hasOwnProperty(value.personal.internet) ? $scope.internet[value.personal.internet]++ : $scope.internet[value.personal.internet] = 1;
                $scope.jobs.hasOwnProperty(value.personal.job.val) ? $scope.jobs[value.personal.job.val]++ : $scope.jobs[value.personal.job.val] = 1;
                $scope.age.hasOwnProperty(value.personal.age) ? $scope.age[value.personal.age]++ : $scope.age[value.personal.age] = 1;
                angular.forEach(value.questions, function (questions) {
                    angular.forEach(questions, function (question, key) {
                        if (question != null && question.answer != undefined  && question.answer != "" && typeof question === 'object') {
                            if (!$scope.questionChart.hasOwnProperty(key)) {
                                $scope.questionChart[key] = {chart: {}, export: [], question: question.question };
                                $scope.questionChart[key].chart.type = "ColumnChart";
                                $scope.questionChart[key].chart.data =
                                    {
                                        "cols": [
                                            {id: "s", label: "Antwort", type: "string"},
                                            {id: "p", label: "Personen", type: "number"},
                                            {role: "style", type: "string"}
                                        ],
                                        "rows": []
                                    };
                                $scope.questionChart[key].chart.options = {
                                    'title': question.question,
                                    'colors': [createRandomColor()]
                                };
                                if (typeof question.answer === 'object') {
                                    angular.forEach(question.answer, function (answer) {
                                        if (answer != false) {
                                            $scope.questionChart[key].chart.data.rows.push({c: [{v: answer}, {v: 1}]});
                                            $scope.questionChart[key].export.push([answer, 1]);
                                        }
                                    });
                                } else {
                                    $scope.questionChart[key].chart.data.rows.push({c: [{v: question.answer}, {v: 1}]});
                                    $scope.questionChart[key].export.push([question.answer, 1]);
                                }
                            } else {
                                if (typeof question.answer === 'object') {
                                    angular.forEach(question.answer, function (answer) {
                                        if (answer != false) {
                                            var found = false;
                                            angular.forEach($scope.questionChart[key].chart.data.rows, function (row) {
                                                if (row.c[0].v == answer) {
                                                    $scope.questionChart[key].export[index][1]++;
                                                    row.c[1].v++;
                                                    found = true;
                                                }
                                            });
                                            if (!found) {
                                                $scope.questionChart[key].chart.data.rows.push({c: [{v: answer}, {v: 1}]});
                                                $scope.questionChart[key].export.push([answer, 1]);
                                            }
                                        }
                                    });
                                } else {
                                    var found = false;
                                    angular.forEach($scope.questionChart[key].chart.data.rows, function (row) {
                                        if (row.c[0].v == question.answer) {
                                            $scope.questionChart[key].export[index][1]++;
                                            row.c[1].v++;
                                            found = true;
                                        }
                                    });
                                    if (!found) {
                                        $scope.questionChart[key].chart.data.rows.push({c: [{v: question.answer}, {v: 1}]});
                                        $scope.questionChart[key].chart.data.rows.push({c: [{v: question.answer}, {v: 1}]});
                                    }
                                }
                            }
                        }
                    });
                });
            }
        });
        $scope.questionChart = $scope.questionChart.filter(function(n){ return n != undefined });
        $scope.sexChart = {};
        $scope.sexChart.type = "ColumnChart";
        $scope.sexChart.data =
            {"cols": [
                    {id: "s", label: "Sex", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
            "rows": [{c: [{v: "Männlich"}, { v: $scope.sex['männlich']}]},
                    {c: [{v: "Weiblich"}, {v: $scope.sex['weiblich']}]},
                    {c: [{v: "Keine Angaben"}, {v: $scope.sex['keine Angabe']}]}
                ]
            };
        $scope.sexChart.options = {'title': 'Aufteilung nach Geschlechter'};
        $scope.internetChart = {};
        $scope.internetChart.type = "ColumnChart";
        $scope.internetChart.data =
            {"cols": [
                    {id: "i", label: "Internetverwendung", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
            "rows": [{c: [{v: "Täglich"}, { v: $scope.internet['täglich']}]},
                    {c: [{v: "4-6 mal"}, {v: $scope.internet['4-6 mal']}]},
                    {c: [{v: "2-3 mal"}, {v: $scope.internet['2-3 mal']}]},
                    {c: [{v: "1 mal"}, {v: $scope.internet['1 mal']}]},
                    {c: [{v: "seltener"}, {v: $scope.internet['seltener']}]},
                    {c: [{v: "keine Angabe"}, {v: $scope.internet['kein Angabe']}]}
                ]
            };
        $scope.internetChart.options = {'title': 'Wöchentliche Internetnutzung'};
        $scope.jobsChart = {};
        $scope.jobsChart.type = "ColumnChart";
        $scope.jobsChart.data =
            {"cols": [
                    {id: "i", label: "Beruf", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
            "rows": [{c: [{v: "Schüler"}, { v: $scope.jobs['schueler']}]},
                    {c: [{v: "Student"}, {v: $scope.jobs['student']}]},
                    {c: [{v: "Angestellter"}, {v: $scope.jobs['angestellter']}]},
                    {c: [{v: "Selbstständig"}, {v: $scope.jobs['selbstständig']}]},
                    {c: [{v: "Rentner"}, {v: $scope.jobs['rentner']}]},
                    {c: [{v: "Hausfrau/mann"}, {v: $scope.jobs['hausfrau']}]},
                    {c: [{v: "Freiberufler"}, {v: $scope.jobs['freiberufler']}]},
                    {c: [{v: "Beamte/r"}, {v: $scope.jobs['beamte']}]},
                    {c: [{v: "Nicht Erwerbstätig"}, {v: $scope.jobs['nicht-erwerbstätig']}]},
                    {c: [{v: "Auszubildend"}, {v: $scope.jobs['auszubildend']}]},
                    {c: [{v: "keine Angabe"}, {v: $scope.jobs['keine-angabe']}]}
                ]
            };
        $scope.jobsChart.options = {'title': 'Anzahl Berufsgruppen'};
        $scope.ageChart = {};
        $scope.ageChart.type = "ColumnChart";
        $scope.ageChart.data =
            {"cols": [
                {id: "i", label: "Altersgruppe", type: "string"},
                {id: "p", label: "Personen", type: "number"}
            ],
                "rows": [{c: [{v: "10 - 18 Jahre"}, { v: $scope.age['10 - 18 Jahre']}]},
                    {c: [{v: "18 - 30 Jahre"}, {v: $scope.age['18 - 30 Jahre']}]},
                    {c: [{v: "30 - 40 Jahre"}, {v: $scope.age['30 - 40 Jahre']}]},
                    {c: [{v: "40 - 50 Jahre"}, {v: $scope.age['40 - 50 Jahre']}]},
                    {c: [{v: "50 - 60 Jahre"}, {v: $scope.age['50 - 60 Jahre']}]},
                    {c: [{v: "60 jahre und älter"}, {v: $scope.age['60 Jahre und älter']}]},
                    {c: [{v: "Keine Anhgabe"}, {v: $scope.age['keine Angabe']}]}
                ]
            };
        $scope.ageChart.options = {'title': 'Altersgruppe'};
        loadingFinished();
    };
});

evalApp.controller('eval2Ctrl', function ($scope, $http, $rootScope,  googleChartApiPromise) {
    $scope.loading = true;
    $rootScope.$watch('fullJson', function () {
        $scope.results = {a: [], b: []};
        if($rootScope.fullJson != undefined) {
            angular.forEach($rootScope.fullJson.eval2, function (value, key) {
                $http.get('../data2/' + value).then(function (response) {
                    if (value.startsWith('a')) {
                        $scope.results['a'].push(response.data);
                    }
                    if (value.startsWith('b')) {
                        $scope.results['b'].push(response.data);
                    }
                    if (key == $rootScope.fullJson.eval2.length - 1) {
                        $scope.jsonLoaded();
                    }
                });
            });
        }
    });

    function loadingFinished() {
        $scope.loading = false;
    }

    googleChartApiPromise.then(loadingFinished);

    $scope.jsonLoaded = function () {
        $scope.sex = {a: {}, b: {}};
        $scope.internet = {a: {}, b: {}};
        $scope.jobs = {a: {}, b: {}};
        $scope.age = {a: {}, b: {}};
        $scope.dTime = {a: [], b: []};
        $scope.questionChart = [];
        $scope.sexChart = {};
        $scope.internetChart = {};
        $scope.jobsChart = {};
        $scope.ageChart = {};
        $scope.taskChart = {0: {}, 1: {}, 2: {}, 3: {}};
        for(var i = 1; i < 5; i++) {
            $scope.taskChart[i-1] = {};
            $scope.taskChart[i-1].type = "ColumnChart";
            var isLPL = {a: "", b: ""};
            if(i % 2 == 1) {
                isLPL.a = "(LPL)";
            } else {
                isLPL.b = "(LPL)";
            }
            $scope.taskChart[i-1].data =
                {"cols": [
                    {id: "s", label: "Aufgabe "+i, type: "string"},
                    {id: "t", label: "Zeit", type: "number"},
                    {id: "c", label: "Richtige Antworten", type: "number"}
                ],
                    "rows": [{c: [{v: "Gruppe A" + isLPL.a}, { v: 0}, {v: 0}]},
                        {c: [{v: "Gruppe B" + isLPL.b}, {v: 0}, {v: 0}]}
                        ]
                };
            $scope.taskChart[i-1].options = {'title': 'Aufgabe '+i, 'vAxes': {0: {'title': "Gesamtzeit"}, 1: {'title': 'Score'}}, 'series': {0: {targetAxisIndex: 0}, 1: {targetAxisIndex: 1}}};
        }
        $scope.correctAnswer = {task3: [[0, 2, 4, 5, 6], "Nach Erfüllung des Zwecks"], task4: ["Ja", "Ja", "Nein", "Nein", [0, 2, 5, 6]]}
        angular.forEach($scope.results, function (participant, groupKey) {
            angular.forEach(participant, function (value) {
                console.log(value);
                    switch (groupKey) {
                        case 'a':
                            for (i = 1; i < 5; i++) {
                                $scope.taskChart[i - 1].data.rows[0].c[1].v += value['task' + i].neededTime;
                            }
                            $scope.selectedDate = new Date(value.task1.answer);
                            $scope.correctDate = new Date(value.task1.correctDate);
                            if ($scope.selectedDate.getDay() == $scope.correctDate.getDay()
                                && $scope.selectedDate.getMonth() == $scope.correctDate.getMonth()
                                && $scope.selectedDate.getYear() == $scope.correctDate.getYear()) {
                                $scope.taskChart[0].data.rows[0].c[2].v++;
                            }
                            if (value.task2.bmbf) {
                                $scope.taskChart[1].data.rows[0].c[2].v++;
                            }
                            if (value.task2.versandfirmen) {
                                $scope.taskChart[1].data.rows[0].c[2].v++;
                            }
                            if (value.task2.behoerden) {
                                $scope.taskChart[1].data.rows[0].c[2].v++;
                            }
                            if (value.task2.forschungsinstitute) {
                                $scope.taskChart[1].data.rows[0].c[2].v--;
                            }
                            if (value.task2.partner) {
                                $scope.taskChart[1].data.rows[0].c[2].v--;
                            }
                            for (i = 3; i < 5; i++) {
                                angular.forEach(value['task'+i].answers, function (answer, j) {
                                    if (answer != null) {
                                        if (typeof answer.answer === 'string') {
                                            if($scope.correctAnswer['task'+i][j-1] == answer.answer)  $scope.taskChart[i-1].data.rows[0].c[2].v++;
                                        } else {
                                            for(key = 0; key < 7; key++) {
                                                (answer.answer.hasOwnProperty(key) == $scope.correctAnswer['task'+i][j-1].indexOf(key) != -1) ? $scope.taskChart[i-1].data.rows[0].c[2].v++ : $scope.taskChart[i-1].data.rows[0].c[2].v--;
                                            }

                                        }
                                    }
                                });
                            }
                            break;
                        case 'b':
                            for (i = 1; i < 5; i++) {
                                $scope.taskChart[i - 1].data.rows[1].c[1].v += value['task' + i].neededTime;
                            }
                            $scope.selectedDate = new Date(value.task1.answer);
                            $scope.correctDate = new Date(value.task1.correctDate);
                            if ($scope.selectedDate.getDay() == $scope.correctDate.getDay()
                                && $scope.selectedDate.getMonth() == $scope.correctDate.getMonth()
                                && $scope.selectedDate.getYear() == $scope.correctDate.getYear()) {
                                $scope.taskChart[0].data.rows[1].c[2].v++;
                            }
                            if (value.task2.bmbf) {
                                $scope.taskChart[1].data.rows[1].c[2].v++;
                            }
                            if (value.task2.versandfirmen) {
                                $scope.taskChart[1].data.rows[1].c[2].v++;
                            }
                            if (value.task2.behoerden) {
                                $scope.taskChart[1].data.rows[1].c[2].v++;
                            }
                            if (value.task2.forschungsinstitute) {
                                $scope.taskChart[1].data.rows[1].c[2].v--;
                            }
                            if (value.task2.partner) {
                                $scope.taskChart[1].data.rows[1].c[2].v--;
                            }
                            for (i = 3; i < 5; i++) {
                                angular.forEach(value['task'+i].answers, function (answer, j) {
                                    if (answer != null) {
                                        if (typeof answer.answer === 'string') {
                                            if($scope.correctAnswer['task'+i][j-1] == answer.answer)  $scope.taskChart[i-1].data.rows[1].c[2].v++;
                                        } else {
                                            for(key = 0; key < 7; key++) {
                                                (answer.answer.hasOwnProperty(key) == $scope.correctAnswer['task'+i][j-1].indexOf(key) != -1) ? $scope.taskChart[i-1].data.rows[1].c[2].v++ : $scope.taskChart[i-1].data.rows[1].c[2].v--;
                                            }
                                        }
                                    }
                                });
                            }
                            break;
                    }
                $scope.sex[groupKey].hasOwnProperty(value.personal.gender) ? $scope.sex[groupKey][value.personal.gender]++ : $scope.sex[groupKey][value.personal.gender] = 1;
                $scope.internet[groupKey].hasOwnProperty(value.personal.internet) ? $scope.internet[groupKey][value.personal.internet]++ : $scope.internet[groupKey][value.personal.internet] = 1;
                $scope.jobs[groupKey].hasOwnProperty(value.personal.job.val) ? $scope.jobs[groupKey][value.personal.job.val]++ : $scope.jobs[groupKey][value.personal.job.val] = 1;
                $scope.age[groupKey].hasOwnProperty(value.personal.age) ? $scope.age[groupKey][value.personal.age]++ : $scope.age[groupKey][value.personal.age] = 1;

            });
            $scope.sexChart[groupKey] = {};
            $scope.sexChart[groupKey].type = "ColumnChart";
            $scope.sexChart[groupKey].data =
                {"cols": [
                    {id: "s", label: "Sex", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "Männlich"}, { v: $scope.sex[groupKey]['männlich']}]},
                        {c: [{v: "Weiblich"}, {v: $scope.sex[groupKey]['weiblich']}]},
                        {c: [{v: "Keine Angaben"}, {v: $scope.sex[groupKey]['keine Angabe']}]}
                    ]
                };
            $scope.sexChart[groupKey].options = {'title': 'Aufteilung nach Geschlechter'};
            $scope.internetChart[groupKey] = {};
            $scope.internetChart[groupKey].type = "ColumnChart";
            $scope.internetChart[groupKey].data =
                {"cols": [
                    {id: "i", label: "Internetverwendung", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "Täglich"}, { v: $scope.internet[groupKey]['täglich']}]},
                        {c: [{v: "4-6 mal"}, {v: $scope.internet[groupKey]['4-6 mal']}]},
                        {c: [{v: "2-3 mal"}, {v: $scope.internet[groupKey]['2-3 mal']}]},
                        {c: [{v: "1 mal"}, {v: $scope.internet[groupKey]['1 mal']}]},
                        {c: [{v: "seltener"}, {v: $scope.internet[groupKey]['seltener']}]},
                        {c: [{v: "keine Angabe"}, {v: $scope.internet[groupKey]['kein Angabe']}]}
                    ]
                };
            $scope.internetChart[groupKey].options = {'title': 'Wöchentliche Internetnutzung'};
            $scope.jobsChart[groupKey] = {};
            $scope.jobsChart[groupKey].type = "ColumnChart";
            $scope.jobsChart[groupKey].data =
                {"cols": [
                    {id: "i", label: "Beruf", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "Schüler"}, { v: $scope.jobs[groupKey]['schueler']}]},
                        {c: [{v: "Student"}, {v: $scope.jobs[groupKey]['student']}]},
                        {c: [{v: "Angestellter"}, {v: $scope.jobs[groupKey]['angestellter']}]},
                        {c: [{v: "Selbstständig"}, {v: $scope.jobs[groupKey]['selbstständig']}]},
                        {c: [{v: "Rentner"}, {v: $scope.jobs[groupKey]['rentner']}]},
                        {c: [{v: "Hausfrau/mann"}, {v: $scope.jobs[groupKey]['hausfrau']}]},
                        {c: [{v: "Freiberufler"}, {v: $scope.jobs[groupKey]['freiberufler']}]},
                        {c: [{v: "Beamte/r"}, {v: $scope.jobs[groupKey]['beamte']}]},
                        {c: [{v: "Nicht Erwerbstätig"}, {v: $scope.jobs[groupKey]['nicht-erwerbstätig']}]},
                        {c: [{v: "Auszubildend"}, {v: $scope.jobs[groupKey]['auszubildend']}]},
                        {c: [{v: "keine Angabe"}, {v: $scope.jobs[groupKey]['keine-angabe']}]}
                    ]
                };
            $scope.jobsChart[groupKey].options = {'title': 'Anzahl Berufsgruppen'};
            $scope.ageChart[groupKey] = {};
            $scope.ageChart[groupKey].type = "ColumnChart";
            $scope.ageChart[groupKey].data =
                {"cols": [
                    {id: "i", label: "Altersgruppe", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "10 - 18 Jahre"}, { v: $scope.age[groupKey]['10 - 18 Jahre']}]},
                        {c: [{v: "18 - 30 Jahre"}, {v: $scope.age[groupKey]['18 - 30 Jahre']}]},
                        {c: [{v: "30 - 40 Jahre"}, {v: $scope.age[groupKey]['30 - 40 Jahre']}]},
                        {c: [{v: "40 - 50 Jahre"}, {v: $scope.age[groupKey]['40 - 50 Jahre']}]},
                        {c: [{v: "50 - 60 Jahre"}, {v: $scope.age[groupKey]['50 - 60 Jahre']}]},
                        {c: [{v: "60 jahre und älter"}, {v: $scope.age[groupKey]['60 Jahre und älter']}]},
                        {c: [{v: "Keine Anhgabe"}, {v: $scope.age[groupKey]['keine Angabe']}]}
                    ]
                };
            $scope.ageChart[groupKey].options = {'title': 'Altersgruppe'};
        });
        for (i = 1; i < 5; i++) {
            $scope.taskChart[i - 1].data.rows[0].c[1].v /= $scope.results.a.length;
            $scope.taskChart[i - 1].data.rows[1].c[1].v /= $scope.results.b.length;
        }
    };
});

evalApp.controller('eval3Ctrl', function ($scope, $http, $rootScope,  googleChartApiPromise) {
    $scope.loading = true;
    $rootScope.$watch('fullJson', function () {
        $scope.results = {a: [], b: []};
        if($rootScope.fullJson != undefined) {
            angular.forEach($rootScope.fullJson.eval3, function (value, key) {
                $http.get('../data3/' + value).then(function (response) {
                    if (value.startsWith('a')) {
                        $scope.results['a'].push(response.data);
                    }
                    if (value.startsWith('b')) {
                        $scope.results['b'].push(response.data);
                    }
                    if (key == $rootScope.fullJson.eval3.length - 1) {
                        $scope.jsonLoaded();
                    }
                })
            });
        }
    });

    function loadingFinished() {
        $scope.loading = false;
    }

    googleChartApiPromise.then(loadingFinished);

    $scope.jsonLoaded = function () {
        $scope.sex = {a: {}, b: {}};
        $scope.internet = {a: {}, b: {}};
        $scope.jobs = {a: {}, b: {}};
        $scope.age = {a: {}, b: {}};
        $scope.dTime = {a: [], b: []};
        $scope.questionChart = [];
        $scope.sexChart = {};
        $scope.internetChart = {};
        $scope.jobsChart = {};
        $scope.ageChart = {};
        $scope.taskChart = {0: {}, 1: {}};
        for(var i = 1; i < 3; i++) {
            $scope.taskChart[i-1] = {};
            $scope.taskChart[i-1].type = "ColumnChart";
            var isLPL = {a: "", b: ""};
            if(i % 2 == 1) {
                isLPL.a = "(mit Übersicht)";
            } else {
                isLPL.b = "(mit Übersicht)";
            }
            $scope.taskChart[i-1].data =
                {"cols": [
                    {id: "s", label: "Aufgabe "+i, type: "string"},
                    {id: "t", label: "Zeit", type: "number"},
                    {id: "c", label: "Richtige Antworten", type: "number"}
                ],
                    "rows": [{c: [{v: "Gruppe A" + isLPL.a}, { v: 0}, {v: 0}]},
                        {c: [{v: "Gruppe B" + isLPL.b}, {v: 0}, {v: 0}]}
                    ]
                };
            $scope.taskChart[i-1].options = {'title': 'Aufgabe '+i, 'vAxes': {0: {'title': "Gesamtzeit"}, 1: {'title': 'Score'}}, 'series': {0: {targetAxisIndex: 0}, 1: {targetAxisIndex: 1}}};
        }
        $scope.correctAnswer = {task1: [true, false, true, false, true, false, true], task2: ["Ja", "Ja", "Nein"]}
        angular.forEach($scope.results, function (participant, groupKey) {
            angular.forEach(participant, function (value) {
                switch (groupKey) {
                    case 'a':
                        for (i = 1; i < 3; i++) {
                            $scope.taskChart[i - 1].data.rows[0].c[1].v += value['task' + i].neededTime;
                            angular.forEach(value['task'+i].answers, function (answer, j) {
                                if (answer != null) {
                                    if (typeof answer.answer === 'string') {
                                        if($scope.correctAnswer['task'+i][j-1] == answer.answer)  $scope.taskChart[i-1].data.rows[0].c[2].v++;
                                    } else {
                                        angular.forEach($scope.correctAnswer.task1, function (correct, key) {
                                            (answer.answer.hasOwnProperty(key) == correct) ? $scope.taskChart[i-1].data.rows[0].c[2].v++ : $scope.taskChart[i-1].data.rows[0].c[2].v--;
                                        });
                                    }
                                }
                            });
                        }
                        break;
                    case 'b':
                        for (i = 1; i < 3; i++) {
                            $scope.taskChart[i - 1].data.rows[1].c[1].v += value['task' + i].neededTime;
                            angular.forEach(value['task'+i].answers, function (answer, j) {
                                if (answer != null) {
                                    if (typeof answer.answer === 'string') {
                                        if($scope.correctAnswer['task'+i][j-1] == answer.answer) $scope.taskChart[i-1].data.rows[1].c[2].v++;
                                    } else {
                                        angular.forEach($scope.correctAnswer.task1, function (correct, key) {
                                            (answer.answer.hasOwnProperty(key) == correct) ? $scope.taskChart[i-1].data.rows[1].c[2].v++ : $scope.taskChart[i-1].data.rows[1].c[2].v--;

                                        });
                                    }
                                }
                            });
                        }
                        break;
                }
                $scope.sex[groupKey].hasOwnProperty(value.personal.gender) ? $scope.sex[groupKey][value.personal.gender]++ : $scope.sex[groupKey][value.personal.gender] = 1;
                $scope.internet[groupKey].hasOwnProperty(value.personal.internet) ? $scope.internet[groupKey][value.personal.internet]++ : $scope.internet[groupKey][value.personal.internet] = 1;
                $scope.jobs[groupKey].hasOwnProperty(value.personal.job.val) ? $scope.jobs[groupKey][value.personal.job.val]++ : $scope.jobs[groupKey][value.personal.job.val] = 1;
                $scope.age[groupKey].hasOwnProperty(value.personal.age) ? $scope.age[groupKey][value.personal.age]++ : $scope.age[groupKey][value.personal.age] = 1;

            });
            $scope.sexChart[groupKey] = {};
            $scope.sexChart[groupKey].type = "ColumnChart";
            $scope.sexChart[groupKey].data =
                {"cols": [
                    {id: "s", label: "Sex", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "Männlich"}, { v: $scope.sex[groupKey]['männlich']}]},
                        {c: [{v: "Weiblich"}, {v: $scope.sex[groupKey]['weiblich']}]},
                        {c: [{v: "Keine Angaben"}, {v: $scope.sex[groupKey]['keine Angabe']}]}
                    ]
                };
            $scope.sexChart[groupKey].options = {'title': 'Aufteilung nach Geschlechter'};
            $scope.internetChart[groupKey] = {};
            $scope.internetChart[groupKey].type = "ColumnChart";
            $scope.internetChart[groupKey].data =
                {"cols": [
                    {id: "i", label: "Internetverwendung", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "Täglich"}, { v: $scope.internet[groupKey]['täglich']}]},
                        {c: [{v: "4-6 mal"}, {v: $scope.internet[groupKey]['4-6 mal']}]},
                        {c: [{v: "2-3 mal"}, {v: $scope.internet[groupKey]['2-3 mal']}]},
                        {c: [{v: "1 mal"}, {v: $scope.internet[groupKey]['1 mal']}]},
                        {c: [{v: "seltener"}, {v: $scope.internet[groupKey]['seltener']}]},
                        {c: [{v: "keine Angabe"}, {v: $scope.internet[groupKey]['kein Angabe']}]}
                    ]
                };
            $scope.internetChart[groupKey].options = {'title': 'Wöchentliche Internetnutzung'};
            $scope.jobsChart[groupKey] = {};
            $scope.jobsChart[groupKey].type = "ColumnChart";
            $scope.jobsChart[groupKey].data =
                {"cols": [
                    {id: "i", label: "Beruf", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "Schüler"}, { v: $scope.jobs[groupKey]['schueler']}]},
                        {c: [{v: "Student"}, {v: $scope.jobs[groupKey]['student']}]},
                        {c: [{v: "Angestellter"}, {v: $scope.jobs[groupKey]['angestellter']}]},
                        {c: [{v: "Selbstständig"}, {v: $scope.jobs[groupKey]['selbstständig']}]},
                        {c: [{v: "Rentner"}, {v: $scope.jobs[groupKey]['rentner']}]},
                        {c: [{v: "Hausfrau/mann"}, {v: $scope.jobs[groupKey]['hausfrau']}]},
                        {c: [{v: "Freiberufler"}, {v: $scope.jobs[groupKey]['freiberufler']}]},
                        {c: [{v: "Beamte/r"}, {v: $scope.jobs[groupKey]['beamte']}]},
                        {c: [{v: "Nicht Erwerbstätig"}, {v: $scope.jobs[groupKey]['nicht-erwerbstätig']}]},
                        {c: [{v: "Auszubildend"}, {v: $scope.jobs[groupKey]['auszubildend']}]},
                        {c: [{v: "keine Angabe"}, {v: $scope.jobs[groupKey]['keine-angabe']}]}
                    ]
                };
            $scope.jobsChart[groupKey].options = {'title': 'Anzahl Berufsgruppen'};
            $scope.ageChart[groupKey] = {};
            $scope.ageChart[groupKey].type = "ColumnChart";
            $scope.ageChart[groupKey].data =
                {"cols": [
                    {id: "i", label: "Altersgruppe", type: "string"},
                    {id: "p", label: "Personen", type: "number"}
                ],
                    "rows": [{c: [{v: "10 - 18 Jahre"}, { v: $scope.age[groupKey]['10 - 18 Jahre']}]},
                        {c: [{v: "18 - 30 Jahre"}, {v: $scope.age[groupKey]['18 - 30 Jahre']}]},
                        {c: [{v: "30 - 40 Jahre"}, {v: $scope.age[groupKey]['30 - 40 Jahre']}]},
                        {c: [{v: "40 - 50 Jahre"}, {v: $scope.age[groupKey]['40 - 50 Jahre']}]},
                        {c: [{v: "50 - 60 Jahre"}, {v: $scope.age[groupKey]['50 - 60 Jahre']}]},
                        {c: [{v: "60 jahre und älter"}, {v: $scope.age[groupKey]['60 Jahre und älter']}]},
                        {c: [{v: "Keine Anhgabe"}, {v: $scope.age[groupKey]['keine Angabe']}]}
                    ]
                };
            $scope.ageChart[groupKey].options = {'title': 'Altersgruppe'};
        });
        for (i = 1; i < 3; i++) {
            $scope.taskChart[i - 1].data.rows[0].c[1].v /= $scope.results.a.length;
            $scope.taskChart[i - 1].data.rows[1].c[1].v /= $scope.results.b.length;
        }
    };
});

evalApp.controller('eval4Ctrl', function ($scope, $rootScope, $http, googleChartApiPromise) {
    $scope.loading = true;
    $rootScope.$watch('fullJson', function () {
        $scope.results = [];
        if($rootScope.fullJson != undefined) {
            angular.forEach($rootScope.fullJson.eval4, function (value, key) {
                $http.get('../data4/' + value).then(function (response) {
                    $scope.results.push(response.data);
                    if (key == $rootScope.fullJson.eval1.length - 1) {
                        $scope.jsonLoaded();
                    }
                });
            });
        }
    });

    function loadingFinished() {
        $scope.loading = false;
    }

    googleChartApiPromise.then(loadingFinished);

    function createRandomColor() {
        var number = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += number[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    $scope.jsonLoaded = function () {
        $scope.sex = {};
        $scope.internet = {};
        $scope.jobs = {};
        $scope.age = {};
        $scope.dTime1 = 0;
        $scope.dTime2 = 0;
        $scope.dTime3 = 0;
        $scope.questionChart = [];
        angular.forEach($scope.results, function (value) {
            $scope.sex.hasOwnProperty(value.personal.gender) ? $scope.sex[value.personal.gender]++ : $scope.sex[value.personal.gender] = 1;
            $scope.internet.hasOwnProperty(value.personal.internet) ? $scope.internet[value.personal.internet]++ : $scope.internet[value.personal.internet] = 1;
            $scope.jobs.hasOwnProperty(value.personal.job.val) ? $scope.jobs[value.personal.job.val]++ : $scope.jobs[value.personal.job.val] = 1;
            $scope.age.hasOwnProperty(value.personal.age) ? $scope.age[value.personal.age]++ : $scope.age[value.personal.age] = 1;
            angular.forEach(value.questions, function (questions) {
                angular.forEach(questions, function (question, key) {
                    if (question != null && question.answer != undefined  && question.answer != "" && typeof question === 'object') {
                        if (!$scope.questionChart.hasOwnProperty(key)) {
                            $scope.questionChart[key] = {chart: {}, export: [], question: question.question };
                            $scope.questionChart[key].chart.type = "ColumnChart";
                            $scope.questionChart[key].chart.data =
                                {
                                    "cols": [
                                        {id: "s", label: "Antwort", type: "string"},
                                        {id: "p", label: "Personen", type: "number"},
                                        {role: "style", type: "string"}
                                    ],
                                    "rows": []
                                };
                            $scope.questionChart[key].chart.options = {
                                'title': question.question,
                                'colors': [createRandomColor()]
                            };
                            if (typeof question.answer === 'object') {
                                angular.forEach(question.answer, function (answer) {
                                    if (answer != false) {
                                        $scope.questionChart[key].chart.data.rows.push({c: [{v: answer}, {v: 1}]});
                                        $scope.questionChart[key].export.push([answer, 1]);
                                    }
                                });
                            } else {
                                $scope.questionChart[key].chart.data.rows.push({c: [{v: question.answer}, {v: 1}]});
                                $scope.questionChart[key].export.push([question.answer, 1]);
                            }
                        } else {
                            if (typeof question.answer === 'object') {
                                angular.forEach(question.answer, function (answer) {
                                    if (answer != false) {
                                        var found = false;
                                        angular.forEach($scope.questionChart[key].chart.data.rows, function (row, index) {
                                            if (row.c[0].v == answer) {
                                                $scope.questionChart[key].export[index][1]++;
                                                row.c[1].v++;
                                                found = true;
                                            }
                                        });
                                        if (!found) {
                                            $scope.questionChart[key].chart.data.rows.push({c: [{v: answer}, {v: 1}]});
                                            $scope.questionChart[key].export.push([answer, 1]);

                                        }
                                    }
                                });
                            } else {
                                var found = false;
                                angular.forEach($scope.questionChart[key].chart.data.rows, function (row, index) {
                                    if (row.c[0].v == question.answer) {
                                        $scope.questionChart[key].export[index][1]++;
                                        row.c[1].v++;
                                        found = true;
                                    }
                                });
                                if (!found) {
                                    $scope.questionChart[key].export.push([question.answer, 1]);
                                    $scope.questionChart[key].chart.data.rows.push({c: [{v: question.answer}, {v: 1}]});
                                }
                            }
                        }
                    }
                });
            });
        });
        $scope.questionChart = $scope.questionChart.filter(function(n){ return n != undefined });
        $scope.sexChart = {};
        $scope.sexChart.type = "ColumnChart";
        $scope.sexChart.data =
            {"cols": [
                {id: "s", label: "Sex", type: "string"},
                {id: "p", label: "Personen", type: "number"}
            ],
                "rows": [{c: [{v: "Männlich"}, { v: $scope.sex['männlich']}]},
                    {c: [{v: "Weiblich"}, {v: $scope.sex['weiblich']}]},
                    {c: [{v: "Keine Angaben"}, {v: $scope.sex['keine Angabe']}]}
                ]
            };
        $scope.sexChart.options = {'title': 'Aufteilung nach Geschlechter'};
        $scope.internetChart = {};
        $scope.internetChart.type = "ColumnChart";
        $scope.internetChart.data =
            {"cols": [
                {id: "i", label: "Internetverwendung", type: "string"},
                {id: "p", label: "Personen", type: "number"}
            ],
                "rows": [{c: [{v: "Täglich"}, { v: $scope.internet['täglich']}]},
                    {c: [{v: "4-6 mal"}, {v: $scope.internet['4-6 mal']}]},
                    {c: [{v: "2-3 mal"}, {v: $scope.internet['2-3 mal']}]},
                    {c: [{v: "1 mal"}, {v: $scope.internet['1 mal']}]},
                    {c: [{v: "seltener"}, {v: $scope.internet['seltener']}]},
                    {c: [{v: "keine Angabe"}, {v: $scope.internet['kein Angabe']}]}
                ]
            };
        $scope.internetChart.options = {'title': 'Wöchentliche Internetnutzung'};
        $scope.jobsChart = {};
        $scope.jobsChart.type = "ColumnChart";
        $scope.jobsChart.data =
            {"cols": [
                {id: "i", label: "Beruf", type: "string"},
                {id: "p", label: "Personen", type: "number"}
            ],
                "rows": [{c: [{v: "Schüler"}, { v: $scope.jobs['schueler']}]},
                    {c: [{v: "Student"}, {v: $scope.jobs['student']}]},
                    {c: [{v: "Angestellter"}, {v: $scope.jobs['angestellter']}]},
                    {c: [{v: "Selbstständig"}, {v: $scope.jobs['selbstständig']}]},
                    {c: [{v: "Rentner"}, {v: $scope.jobs['rentner']}]},
                    {c: [{v: "Hausfrau/mann"}, {v: $scope.jobs['hausfrau']}]},
                    {c: [{v: "Freiberufler"}, {v: $scope.jobs['freiberufler']}]},
                    {c: [{v: "Beamte/r"}, {v: $scope.jobs['beamte']}]},
                    {c: [{v: "Nicht Erwerbstätig"}, {v: $scope.jobs['nicht-erwerbstätig']}]},
                    {c: [{v: "Auszubildend"}, {v: $scope.jobs['auszubildend']}]},
                    {c: [{v: "keine Angabe"}, {v: $scope.jobs['keine-angabe']}]}
                ]
            };
        $scope.jobsChart.options = {'title': 'Anzahl Berufsgruppen'};
        $scope.ageChart = {};
        $scope.ageChart.type = "ColumnChart";
        $scope.ageChart.data =
            {"cols": [
                {id: "i", label: "Altersgruppe", type: "string"},
                {id: "p", label: "Personen", type: "number"}
            ],
                "rows": [{c: [{v: "10 - 18 Jahre"}, { v: $scope.age['10 - 18 Jahre']}]},
                    {c: [{v: "18 - 30 Jahre"}, {v: $scope.age['18 - 30 Jahre']}]},
                    {c: [{v: "30 - 40 Jahre"}, {v: $scope.age['30 - 40 Jahre']}]},
                    {c: [{v: "40 - 50 Jahre"}, {v: $scope.age['40 - 50 Jahre']}]},
                    {c: [{v: "50 - 60 Jahre"}, {v: $scope.age['50 - 60 Jahre']}]},
                    {c: [{v: "60 jahre und älter"}, {v: $scope.age['60 Jahre und älter']}]},
                    {c: [{v: "Keine Anhgabe"}, {v: $scope.age['keine Angabe']}]}
                ]
            };
        $scope.ageChart[groupKey].options = {'title': 'Altersgruppe'};
    };
});


