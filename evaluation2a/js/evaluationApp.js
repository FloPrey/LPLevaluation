/**
 * Created by flo on 25.04.17.
 */
var evalApp = angular.module('lplevaluation', ['ngRoute', 'ui.bootstrap']);

var serverUrl = "http://evaluation.floprey.at/saveData2a.php";
var mailUrl = "http://evaluation.floprey.at/saveMail.php";


evalApp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'view/personal.html',
            controller: 'personalCtrl'
        }).when('/task1', {
            templateUrl: 'view/task1.html',
            controller: 'task1Ctrl'
        }).when('/task2', {
            templateUrl: 'view/task2.html',
            controller: 'task2Ctrl'
        }).when('/task3', {
            templateUrl: 'view/task3.html',
            controller: 'task3Ctrl'
        }).when('/answertask3', {
            templateUrl: 'view/answer3.html',
            controller: 'answer3Ctrl'
        }).when('/task4', {
            templateUrl: 'view/task4.html',
            controller: 'task4Ctrl'
        }).when('/answertask4', {
            templateUrl: 'view/answer4.html',
            controller: 'answer4Ctrl'
        }).when('/finish', {
            templateUrl: 'view/finished.html',
            controller: 'finishedCtrl'
        });
});

evalApp.controller('appCtrl', function($scope, $http) {

});

evalApp.controller('personalCtrl', function ($scope, $location) {
    if(localStorage.getItem('task1') != undefined) {
        localStorage.removeItem('task1');
    }
    if(localStorage.getItem('task2') != undefined) {
        localStorage.removeItem('task2');
    }
    if(localStorage.getItem('task3') != undefined) {
        localStorage.removeItem('task3');
    }
    if(localStorage.getItem('task4') != undefined) {
        localStorage.removeItem('task4');
    }
    $scope.personal = {};
    $scope.jobs = [{name: 'Schüler', val: 'schueler'},
        {name: 'Student/in', val: 'student'},
        {name: 'Angestellte/r', val: 'angestellter'},
        {name: 'Selbstständig', val: 'selbstständig'},
        {name: 'Rentner/in', val:'rentner'},
        {name: 'Hausfrau/Hausmann', val:'hausfrau'},
        {name: 'Freiberufler/in', val:'freiberufler'},
        {name: 'Beamte/r', val:'beamte'},
        {name: 'Nicht Erwerbstätig', val:'nicht-erwerbstätig'},
        {name: 'Auszubildende/r', val:'auszubildend'},
        {name: 'Kein Angabe', val:'keine-angabe'}];
    $scope.personal.job = $scope.jobs[0];
    $scope.savePersonal = function() {
        localStorage.setItem('personal', JSON.stringify($scope.personal));
        $location.url('task1');
    }
});

evalApp.controller('task1Ctrl', function ($scope, $location) {
    $scope.task1 = {};
    $scope.task1.question = "In der Datenschutzerklärung wird angeführt für wie lange Daten gespeichert werden. Wenn Daten heute erhoben werden, "+
                            "bis zu welchem Tag werden diese dann gespeichert?";
    $scope.dateOptions = {
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };
    $scope.starttime = performance.now();
    lpl.create("lplTemplate", {lplLoad: "ajax", lplRaw: "lpltask1.json", lplRes: "lplRes", triggerForm: true, lang: "de"});
    $scope.saveTask = function() {
        if ($scope.questionForm.$valid) {
            $scope.date = new Date();
            $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
            $scope.task1.neededTime = $scope.neededTime;
            $scope.correctDate = new Date();
            $scope.correctDate.setHours(0,0,0,0);
            $scope.correctDate.setDate($scope.date.getDate() + 7);
            $scope.task1.correctDate = $scope.correctDate;
            localStorage.setItem('task1', JSON.stringify($scope.task1));
            $location.url('task2');
        } else {
            $scope.hasError = true;
            var id = $location.hash();
            $location.hash('top');
            $anchorScroll();
            $location.hash(id);
        }
    }
});

evalApp.controller('task2Ctrl', function ($scope, $location) {
    $scope.task2 = {};
    $scope.task2.question = "In der Datenschutzerklärung wird angeführt an wen die Daten weitergegeben werden dürfen. Welche Empfänger der Daten werden in dieser Datenschutzerklärung angegeben?";
    $scope.dateOptions = {
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };
    $scope.date = new Date();
    $scope.starttime = performance.now();
    $scope.saveTask = function() {
        if ($scope.questionForm.$valid) {
            $scope.date = new Date();
            $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
            $scope.task2.neededTime = $scope.neededTime;
            localStorage.setItem('task2', JSON.stringify($scope.task2));
            $location.url('task3');
        } else {
            $scope.hasError = true;
            var id = $location.hash();
            $location.hash('top');
            $anchorScroll();
            $location.hash(id);
        }
    }
});

evalApp.controller('task3Ctrl', function ($scope, $location) {
    $scope.task3 = {counter: 0};
    $scope.task3.question = "Im nächsten Schritt, informieren Sie sich bitte selbst wie und wozu ihre Daten verwendet werden dürfen/können. Wenn Sie fertig sind, klicken Sie auf weiter. Im nächsten Schritt werden Ihnen dazu Fragen gestellt.";
    $scope.dateOptions = {
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    if(localStorage.getItem('task3') != undefined) {
        var task3 = JSON.parse(localStorage.getItem('task3'));
        task3.counter++;
        localStorage.setItem('task3', JSON.stringify(task3));
        usedTime = task3.neededTime;
    }
lpl.create("lplTemplate", {lplLoad: "ajax", lplRaw: "lpltask3.json", lplRes: "lplRes", triggerForm: true, lang: "de"});
    $scope.saveTask = function() {
        $scope.date = new Date();
        $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
        $scope.task3.neededTime = usedTime + $scope.neededTime;
        localStorage.setItem('task3', JSON.stringify($scope.task3));
        $location.url('answertask3');
    }
});

evalApp.controller('answer3Ctrl', function ($scope, $location) {
    $scope.task3 = {};
    $scope.questionHeader = "Fragen zu Aufgabe 3";
    $scope.useranswers = [];
    $scope.task3.questions = [
        {
            id: 1,
            question: "Zu welchen Zwecken werden Daten in dieser Datenschutzerklärung erhoben?",
            type: "checkbox",
            answers: ["Statistik", "Werbezwecke", "Jahresbericht", "Erhöhen der internen Sicherheit", "Öffentliche Meldungen", "Erfahrungsberichte", "Kontaktaufnahem"]
        },
        {
            id: 2,
            question: "Wie lange werden sämtliche Daten gespeichert?",
            type: "radio",
            answers: ["Keine Löschpflicht", "Bis zum Ende dieses Jahres", "Nach Erfüllung des Zwecks"]
        }
    ];
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    if(localStorage.getItem('task3') != undefined) {
        var task3 = JSON.parse(localStorage.getItem('task3'));
        task3.counter++;
        localStorage.setItem('task3', JSON.stringify(task3));
        usedTime = task3.neededTime;
    }
    $scope.save = function() {
        if ($scope.questionForm.$valid) {
            $scope.date = new Date();
            $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
            $scope.task3.neededTime = usedTime + $scope.neededTime;
            $scope.task3.answers = $scope.useranswers;
            localStorage.setItem('task3', JSON.stringify($scope.task3));
            $location.url('task4');
        } else {
            $scope.hasError = true;
            var id = $location.hash();
            $location.hash('top');
            $anchorScroll();
            $location.hash(id);
        }
    }
});

evalApp.controller('task4Ctrl', function ($scope, $location) {
    $scope.task4 = {};
    $scope.task4.question = "Im nächsten Schritt, informieren Sie sich bitte selbst wie und wozu ihre Daten verwendet werden dürfen/können.  Wenn Sie fertig sind, klicken Sie auf weiter. Im nächsten Schritt werden Ihnen dazu Fragen gestellt.";
    $scope.dateOptions = {
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    if(localStorage.getItem('task4') != undefined) {
        var task4 = JSON.parse(localStorage.getItem('task3'));
        task4.counter++;
        localStorage.setItem('task4', JSON.stringify(task4));
        usedTime = task4.neededTime;
    }
    $scope.saveTask = function() {
        $scope.date = new Date();
        $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
        $scope.task4.neededTime = usedTime + $scope.neededTime;
        localStorage.setItem('task4', JSON.stringify($scope.task4));
        $location.url('answertask4');
    }
});

evalApp.controller('answer4Ctrl', function ($scope, $location, $http) {
    $scope.task4 = {counter: 1};
    $scope.questionHeader = "Fragen zu Aufgabe 4";
    $scope.useranswers = [];
    $scope.task4.questions = [
        {
            id: 1,
            question: "Dürfen meine Daten zu Marktforschungszwecke verwendet werden?",
            type: "radio",
            answers: ["Ja", "Nein", "Keine Angabe"]
        },
        {
            id: 2,
            question: "Dürfen meine Daten zum Versand eines Newsletters verwendet werden?",
            type: "radio",
            answers: ["Ja", "Nein", "Keine Angabe"]
        },
        {
            id: 3,
            question: "Dürfen meine Daten veröffentlicht werden?",
            type: "radio",
            answers: ["Ja", "Nein", "Keine Angabe"]
        },
        {
            id: 4,
            question: "Werden meine Kundenkonto Daten an Dritte weitergegeben?",
            type: "radio",
            answers: ["Ja", "Nein", "Keine Angabe"]
        },
        {
            id: 5,
            question: "Wer erhält Informationen zu einem von mir getätigten Kauf?",
            type: "checkbox",
            answers: ["Webshop", "Werbepartner", "Transportunternehmen", "Partnerunternehmen", "Werbeabteilung", "Logistiker", "Banken", "Tochterfirmen", "Keine Angabe"]
        }

    ];
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    if(localStorage.getItem('task4') != undefined) {
        var task4 = JSON.parse(localStorage.getItem('task4'));
        usedTime = task4.neededTime;
    }
    $scope.save = function() {
        if ($scope.questionForm.$valid) {
            $scope.date = new Date();
            $scope.neededTime = (performance.now()- $scope.starttime) / 1000;
            $scope.task4.neededTime = usedTime + $scope.neededTime;
            $scope.task4.answers = $scope.useranswers;
            localStorage.setItem('task4', JSON.stringify($scope.task4));
            var personal = localStorage.getItem('personal');
            var task1 = localStorage.getItem('task1');
            var task2 = localStorage.getItem('task2');
            var task3 = localStorage.getItem('task3');
            $scope.task4.answers = $scope.useranswers;
            $scope.fullAnswer = {
                personal: JSON.parse(personal),
                task1: JSON.parse(task1),
                task2: JSON.parse(task2),
                task3: JSON.parse(task3),
                task4: $scope.task4
            };
            $http({
                method: 'POST', url: serverUrl, data: $scope.fullAnswer, withCredentials: true, headers: {
                    'Content-type': 'application/json; charset=utf-8'
                }
            }).then(function (response) {
                if (response.data.success) {
                    $location.url('finish');
                }
            });
        }
        else {
            $scope.hasError = true;
            var id = $location.hash();
            $location.hash('top');
            $anchorScroll();
            $location.hash(id);
        }

    }
});

evalApp.controller('finishedCtrl', function($scope, $http) {
    $scope.saveMail = function () {
        $http({
            method: 'POST', url: mailUrl, data: $scope.mail, withCredentials: true, headers: {
                'Content-type': 'application/json; charset=utf-8'
            }
        }).then(function (response) {
            if(response.data.success) {
                $scope.alert = "success";
            } else {
                $scope.alert = "danger";
            }
            $scope.message = response.data.message;
            $scope.finished = true;
        })
    }
});




