/**
 * Created by Sjoerd Houben on 09-Nov-15.
 */
// app.js
// =============================================================================
var app = angular.module('formApp', ['ngAnimate', 'ui.router'])

// =============================================================================
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('form', {
                url: '/form',
                templateUrl: 'form.html',
                controller: 'formController'
            })

            .state('form.playerCount', {
                url: '/playerCount',
                templateUrl: 'form-playerCount.html'
            })

            .state('form.expansions', {
                url: '/expansions',
                templateUrl: 'form-expansions.html'
            })

            .state('form.ban', {
                url: '/ban',
                templateUrl: 'form-ban.html'
            })
            .state('form.result', {
                url: '/result',
                templateUrl: 'form-result.html'
            });

        $urlRouterProvider.otherwise('/form/playerCount');
    })
    .filter('range', function () {
        return function (input, total) {
            total = parseInt(total);

            for (var i = 1; i < total; i++) {
                input.push(i);
            }

            return input;
        };
    })
// =============================================================================
    .controller('formController', function ($scope, $http) {

        $scope.started = true;
        $scope.Banned = [];
        $scope.ColLimit = 5;

        $scope.Starting = function () {
            $scope.started = !$scope.started;
        }

        $scope.formData = {};

        $scope.BannedCivs = [];

        $scope.processForm = function () {
            alert('awesome!');
        };

        $http.get('expansions.json')
            .then(function (res) {
                $scope.expansions = res.data;
            });

        $http.get('civs.json')
            .then(function (res) {
                $scope.civs = res.data;
                $scope.processedCivs = processCivs($scope.civs.civilizations, 5);
            });


        function processCivs(array, size) {
            var newArray = [];
            var l = array.length;
            for (var i = 0; i < array.length; i += size) {
                newArray.push(array.slice(i, i + size));
            }
            return newArray;
        };

        $scope.AddOrRemoveFromBanArray = function (civName, index) {
            if ($scope.BannedCivs.length === 0) {
                $scope.BannedCivs.push(civName);
                $scope.Banned[index] = true;
            } else {
                for (var i = 0; i < $scope.BannedCivs.length; i++) {
                    if ($scope.BannedCivs[i] === civName) {
                        $scope.BannedCivs.splice(i, 1);
                        $scope.Banned[index] = false;
                        return;
                    }
                }
                $scope.BannedCivs.push(civName);
                $scope.Banned[index] = true;
            }
        };

        $scope.ResetBanned = function () {
            $scope.BannedCivs = [];
            $scope.Banned = [];
        }

        $scope.Calculate = function () {
            if ($scope.formData.playerCount > 0 && $scope.formData.countCiv > 0) {
                var selectedCivs = [];
                $scope.formData.result = [];
                $scope.civsWithoutBans = $scope.civs.civilizations;

                for (var i = 0; i < $scope.BannedCivs.length; i++) {
                    for (var j = 0; j < $scope.civsWithoutBans.length; j++) {
                        if($scope.BannedCivs[i] === $scope.civsWithoutBans[j].nationName){
                            $scope.civsWithoutBans.splice(j,1);
                        }
                    }
                }


                for (var i = 0; i < $scope.formData.playerCount; i++) {
                    var playerObject = {};
                    playerObject.Name = "Player " + (i + 1);
                    playerObject.civs = [];
                    for (var j = 0; j < $scope.formData.countCiv; j++) {
                        var existsInArray = true;
                        do {
                            var randomNumber = Math.floor((Math.random() * $scope.civsWithoutBans.length))
                            var selectedCiv = $scope.civsWithoutBans[randomNumber];
                            for (var k = 0; k < selectedCivs.length; k++) {
                                if (selectedCiv === selectedCivs[k]) {
                                    existsInArray = true;
                                    break;
                                }
                            }
                            existsInArray = false;
                        } while (existsInArray)
                        playerObject.civs[j] = selectedCiv;
                        selectedCivs.push(selectedCiv);
                    }
                    $scope.formData.result.push(playerObject);
                }
            }
        }

    });
