/**
 * Created by flo on 25.04.17.
 */
var evalApp = angular.module('lplevaluation', ['ngRoute', 'ngCookies',  'ngAnimate', 'ui.bootstrap']);

var serverUrl = "http://evaluation.floprey.at/saveData.php";
var mailUrl = "http://evaluation.floprey.at/saveMail.php";
var firstQuestionFile = "question";

evalApp.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/personal.html',
            controller: 'personalCtrl'
        }).when('/fragen/:question', {
            templateUrl: 'views/question.html',
            controller: 'questionsCtrl'
        }).when('/finished', {
            templateUrl: 'views/finished.html',
            controller: 'finishedCtrl'
        });
});

evalApp.controller('personalCtrl', function ($scope, $location, $anchorScroll) {
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
        if($scope.personalForm.$valid) {
            localStorage.setItem('personal', JSON.stringify($scope.personal));
            $location.url('fragen/' + firstQuestionFile);
        } else {
            $scope.hasError = true;
            var id = $location.hash();
            $location.hash('top');
            $anchorScroll();
            $location.hash(id);
        }
    }
});

evalApp.controller('questionsCtrl', function($scope, $http, $routeParams, $location, $anchorScroll) {
    $scope.questionFile = $routeParams.question;
    $scope.questionHeader = "Bitte beantworten Sie die Fragen!";
    $scope.questions = [];
    $scope.useranswers = [];
    $scope.pastQuestion = JSON.parse(localStorage.getItem('questions'));
    $scope.hasError = false;
    var startTime = 0;
    if($scope.pastQuestion == null) {
        $scope.pastQuestion = {};
    }
    $http.get('questions/'+$scope.questionFile+'.json').then(function (response) {
        $scope.questions = response.data;
        startTime = performance.now();
    });
    $scope.continue = function() {
        if($scope.questionForm.$valid) {
            var endTime = performance.now();
            $scope.pastQuestion[$scope.questionFile] = $scope.useranswers;
            console.log("time" + (endTime - startTime));
            $scope.pastQuestion[$scope.questionFile][0] = '"Time": ' + ((endTime - startTime)/1000);
            localStorage.setItem('questions', JSON.stringify($scope.pastQuestion));
            $location.url('fragen/' + $scope.questions.next);
        } else {
            $scope.hasError = true;
            var id = $location.hash();
            $location.hash('top');
            $anchorScroll();
            $location.hash(id);
        }
    };
    $scope.saveData = function() {
        $scope.data = {};
        if(localStorage.getItem('personal') !== undefined && $scope.questionForm.$valid) {
            var endTime = performance.now();
            $scope.data.personal = JSON.parse(localStorage.getItem('personal'));
            $scope.pastQuestion[$scope.questionFile] = $scope.useranswers;
            $scope.pastQuestion[$scope.questionFile][0] = '"Time": ' + ((endTime - startTime)/1000);
            $scope.data.questions = $scope.pastQuestion;
            $http({
                method: 'POST', url: serverUrl, data: $scope.data, withCredentials: true, headers: {
                    'Content-type': 'application/json; charset=utf-8'
                }
            }).then(function (response) {
                if(response.data.success) {
                    $location.url('finished');
                } else {
                    $scope.alert = "danger";
                }
                $scope.message = response.data.message;
                $scope.finished = true;
                var id = $location.hash();
                $location.hash('top');
                $anchorScroll();
                $location.hash(id);
            });
        } else {
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