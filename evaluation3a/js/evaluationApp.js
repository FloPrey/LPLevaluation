/**
 * Created by flo on 25.04.17.
 */
var evalApp = angular.module('lplevaluation', ['ngRoute', 'ui.bootstrap']);

var serverUrl = "http://evaluation.floprey.at/saveData3a.php";
var mailUrl = "http://evaluation.floprey.at/saveMail.php";


evalApp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'view/personal.html',
            controller: 'personalCtrl'
        }).when('/task1', {
            templateUrl: 'view/task1.html',
            controller: 'task1Ctrl'
        }).when('/answertask1', {
            templateUrl: 'view/answer1.html',
            controller: 'answer1Ctrl'
        }).when('/task2', {
            templateUrl: 'view/task2.html',
            controller: 'task2Ctrl'
        }).when('/answertask2', {
            templateUrl: 'view/answer2.html',
            controller: 'answer2Ctrl'
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
    $scope.personal = {};
    $scope.jobs = [{name: 'Schüler', val: 'schueler'},{name: 'Student', val: 'student'}, {name: 'Angestellter', val: 'angestellter'}, {name: 'Arbeiter', val: 'arbeiter'},{name: 'Pensionist', val:'pensionist'}];
    $scope.personal.job = $scope.jobs[0];
    $scope.savePersonal = function() {
        localStorage.setItem('personal', JSON.stringify($scope.personal));
        $location.url('task1');
    }
});

evalApp.controller('task1Ctrl', function ($scope, $location) {
    $scope.task1 = {counter: 0};
    $scope.task1.question = "Angeführt wird hier eine vereinfachte Form der Datenschutzerklärung. Verschaffen Sie sich einen Überblick darüber welche Daten wie und zu welchen Zwecken verwendet werden.";
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    if(localStorage.getItem('task1') != undefined) {
        var task1 = JSON.parse(localStorage.getItem('task1'));
        task1.counter++;
        localStorage.setItem('task1', JSON.stringify(task1));
        usedTime = task1.neededTime;
    }
    lpl.create("lplTemplate", {lplLoad: "ajax", lplRaw: "lpltask1.json", lplRes: "lplRes", triggerForm: true, lang: "de"});
    $scope.saveTask = function() {
        $scope.date = new Date();
        $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
        $scope.task1.neededTime = usedTime + $scope.neededTime;
        localStorage.setItem('task1', JSON.stringify($scope.task1));
        $location.url('answertask1');
    }
});

evalApp.controller('answer1Ctrl', function ($scope, $location) {
    $scope.task1 = {counter: 1};
    $scope.questionHeader = "Fragen zu Aufgabe 1";
    $scope.task1.questions = [
        {
            id: 1,
            question: "Zu welchen Zwecken werden Daten in dieser Datenschutzerklärung erhoben?",
            type: "checkbox",
            answers: ["Statistik", "Werbezwecke", "Jahresbericht", "Erhöhen der internen Sicherheit", "Öffentliche Meldungen", "Erfahrungsberichte", "Kontaktaufnahem"]
        }
    ];
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    if(localStorage.getItem('task1') != undefined) {
        var task1 = JSON.parse(localStorage.getItem('task1'));
        task1.counter++;
        localStorage.setItem('task1', JSON.stringify(task1));
        usedTime = task1.neededTime;
    }
    $scope.save = function() {
        $scope.date = new Date();
        $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
        $scope.task1.answerTime = usedTime + $scope.neededTime;
        $scope.task1.answers = $scope.useranswers;
        localStorage.setItem('task1', JSON.stringify($scope.task1));
        $location.url('task2');
    }
});

evalApp.controller('task2Ctrl', function ($scope, $location) {
    $scope.task2 = {};
    $scope.task2.question = "Angeführt wird hier eine vereinfachte Form der Datenschutzerklärung. Verschaffen Sie sich einen Überblick darüber welche Daten wie und zu welchen Zwecken verwendet werden.";
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    lpl.create("lplTemplate", {lplLoad: "ajax", lplRaw: "lpltask1.json", lplRes: "lplRes", triggerForm: true, lang: "de", view: {icons: false}});
    if(localStorage.getItem('task2') != undefined) {
        var task2 = JSON.parse(localStorage.getItem('task2'));
        task2.counter++;
        localStorage.setItem('task2', JSON.stringify(task2));
        usedTime = task2.neededTime;
    }
    $scope.saveTask = function() {
        $scope.date = new Date();
        $scope.neededTime = (performance.now() - $scope.starttime) / 1000;
        $scope.task2.neededTime = usedTime + $scope.neededTime;
        localStorage.setItem('task2', JSON.stringify($scope.task2));
        $location.url('answertask2');
    }
});

evalApp.controller('answer2Ctrl', function ($scope, $location, $http) {
    $scope.task2 = {counter: 1};
    $scope.questionHeader = "Fragen zu Aufgabe 2";
    $scope.task2.questions = [
        {
            id: 1,
            question: "Dürfen meine Daten zu Markforschungszwecke verwendet werden?",
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
            question: "Werden meine Kundenkonto Daten an Dritte weitergegeben?",
            type: "radio",
            answers: ["Ja", "Nein", "Keine Angabe"]
        }

    ];
    $scope.date = new Date();
    $scope.starttime = performance.now();
    var usedTime = 0;
    if(localStorage.getItem('task2') != undefined) {
        var task2 = JSON.parse(localStorage.getItem('task2'));
        usedTime = task2.neededTime;
    }
    $scope.save = function() {
        $scope.date = new Date();
        $scope.neededTime = ($scope.date.getTime() - $scope.starttime) / 1000;
        $scope.task2.answerTime = usedTime + $scope.neededTime;
        localStorage.setItem('task2', JSON.stringify($scope.task2));
        var task1 = localStorage.getItem('task1');
        $scope.task2.answers = $scope.useranswers;
        $scope.fullAnswer = {task1: JSON.parse(task1), task2: $scope.task2};
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




