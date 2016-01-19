/**
 * Created by Sjoerd Houben on 09-Nov-15.
 */
// app.js
// =============================================================================
var app = angular.module('formApp', ['ngAnimate', 'ui.router', 'ui.bootstrap'])

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
    .controller('formController', function ($scope, $http, $location, $window) {

            $scope.started = true;
            $scope.isDisabled = true;

            $scope.Banned = [];
            $scope.ColLimit = 5;

            $scope.MinimumCivs = 0;
            $scope.SelectableCivs = 0;
            $scope.SelectedCivsCount = 0;

            $scope.MaxBannable = 0;
            $scope.CurrentlyBanned = 0;

            $scope.showAlert = false;

            $scope.Starting = function () {
                $scope.started = !$scope.started;
            }

            $scope.formData = {};

            $scope.BannedCivs = [];

            $scope.formData.selectedExpansions = [];

            $http.get('expansions.json')
                .then(function (res) {
                    $scope.expansions = res.data;
                });

            $http.get('civs.json')
                .then(function (res) {
                    $scope.civs = res.data;
                    $scope.preprocessedCivs = $scope.civs.civilizations;
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
                    var newCount = $scope.SelectedCivsCount - 1;
                    if (newCount >= $scope.MinimumCivs) {
                        $scope.BannedCivs.push(civName);
                        $scope.Banned[index] = true;
                        $scope.SelectedCivsCount = newCount;
                        $scope.CurrentlyBanned = $scope.CurrentlyBanned + 1;
                        if ($scope.CurrentlyBanned == $scope.MaxBannable) {
                            $scope.BannedType = "warning";
                            $scope.showAlert = true;
                        } else {
                            $scope.BannedType = "info"
                            $scope.showAlert = false;
                        }
                    } else {
                        $scope.showAlert = true;
                    }
                } else {

                    for (var i = 0; i < $scope.BannedCivs.length; i++) {
                        if ($scope.BannedCivs[i] === civName) {
                            $scope.BannedCivs.splice(i, 1);
                            $scope.Banned[index] = false;
                            $scope.SelectedCivsCount = $scope.SelectedCivsCount + 1;
                            $scope.CurrentlyBanned = $scope.CurrentlyBanned - 1;
                            if ($scope.CurrentlyBanned == $scope.MaxBannable) {
                                $scope.BannedType = "warning";
                                $scope.showAlert = true;
                            } else {
                                $scope.BannedType = "info"
                                $scope.showAlert = false;
                            }
                            return;
                        }
                    }
                    var newCount = $scope.SelectedCivsCount - 1;
                    if (newCount >= $scope.MinimumCivs) {
                        $scope.BannedCivs.push(civName);
                        $scope.Banned[index] = true;
                        $scope.SelectedCivsCount = newCount;
                        $scope.CurrentlyBanned = $scope.CurrentlyBanned + 1;
                        if ($scope.CurrentlyBanned == $scope.MaxBannable) {
                            $scope.BannedType = "warning";
                            $scope.showAlert = true;
                        } else {
                            $scope.BannedType = "info"
                            $scope.showAlert = false;
                        }
                    } else {
                        $scope.showAlert = true;
                    }


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
                    $scope.civsWithoutBans = $scope.preprocessedCivs;

                    for (var i = 0; i < $scope.BannedCivs.length; i++) {
                        for (var j = 0; j < $scope.civsWithoutBans.length; j++) {
                            if ($scope.BannedCivs[i] === $scope.civsWithoutBans[j].nationName) {
                                $scope.civsWithoutBans.splice(j, 1);
                            }
                        }
                    }


                    for (var i = 0; i < $scope.formData.playerCount; i++) {
                        var playerObject = {};
                        playerObject.Name = "Player " + (i + 1);
                        playerObject.civs = [];
                        for (var j = 0; j < $scope.formData.countCiv; j++) {
                            var existsInArray = false;
                            do {
                                var randomNumber = Math.floor((Math.random() * $scope.civsWithoutBans.length))
                                var selectedCiv = $scope.civsWithoutBans[randomNumber];
                                for (var k = 0; k < selectedCivs.length; k++) {
                                    if (selectedCiv.nationName === selectedCivs[k].nationName) {
                                        existsInArray = true;
                                        break;
                                    } else {
                                        existsInArray = false;
                                    }
                                }

                            } while (existsInArray)
                            playerObject.civs[j] = selectedCiv;
                            selectedCivs.push(selectedCiv);
                        }
                        $scope.formData.result.push(playerObject);
                    }
                }
            }

            $scope.ExpansionLogic = function () {
                var expansionsSelected = [];

                for (var i = 0; i < $scope.formData.selectedExpansions.length; i++) {
                    if ($scope.formData.selectedExpansions[i] == true) {
                        expansionsSelected.push($scope.expansions.expansion[i]);
                    }
                }

                var i = $scope.preprocessedCivs.length
                while (i--) {
                    var count = 0;
                    for (var j = 0; j < expansionsSelected.length; j++) {
                        if ($scope.preprocessedCivs[i].expansion != expansionsSelected[j]) {
                            if (count == expansionsSelected.length - 1) {
                                $scope.preprocessedCivs.splice(i, 1);
                                break;
                            }
                            count++;
                        } else {
                            break;
                        }

                    }
                }
                $scope.processedCivs = processCivs($scope.preprocessedCivs, 5);
            }


            function GetCivCountFromExpasion(name) {
                var count = 0;
                for (var i = 0; i < $scope.preprocessedCivs.length; i++) {
                    if ($scope.preprocessedCivs[i].expansion == name) {
                        count++;
                    }
                }
                return count;

            }

            $scope.SelectOrUnselectExpansions = function (isSelect) {
                if ($scope.formData.selectedExpansions.length == 0) {
                    $scope.formData.selectedExpansions = new Array($scope.expansions.expansion.length);
                }
                for (var i = 0; i < $scope.formData.selectedExpansions.length; i++) {
                    //if the state is changed
                    $scope.formData.selectedExpansions[i] = isSelect;
                }
            }

            $scope.PlayerCountLogic = function () {
                if ($scope.formData.selectedExpansions.length == 0) {
                    $scope.formData.selectedExpansions = new Array($scope.expansions.expansion.length);
                }
                for (var i = 0; i < $scope.formData.selectedExpansions.length; i++) {
                    $scope.formData.selectedExpansions[i] = true;
                }
                $scope.MinimumCivs = $scope.formData.playerCount * $scope.formData.countCiv;
                $scope.SelectableCivs = $scope.preprocessedCivs.length;
                $scope.SelectedCivsCount = $scope.SelectableCivs;
                $scope.MaxBannable = $scope.SelectableCivs - $scope.MinimumCivs;
            }

            $scope.Reset = function () {
                $location.path('index.html');
                $window.location.reload();
            }

            $scope.UpdateCount = function (name, index) {
                var civsInExpansion = GetCivCountFromExpasion(name);
                if (civsInExpansion == 0)
                    throw "0 civilization in expansion. This is of course impossible";
                var expansionState = $scope.formData.selectedExpansions[index];
                if (expansionState) {
                    $scope.SelectedCivsCount = $scope.SelectedCivsCount + civsInExpansion;
                    $scope.CurrentlyBanned = $scope.CurrentlyBanned - civsInExpansion;
                    if ($scope.CurrentlyBanned == $scope.MaxBannable) {
                        $scope.BannedType = "warning";
                        $scope.showAlert = true;
                    } else {
                        $scope.BannedType = "info"
                        $scope.showAlert = false;
                    }
                } else {

                    var difference = $scope.SelectedCivsCount - civsInExpansion;
                    if (difference < $scope.MinimumCivs) {
                        $scope.formData.selectedExpansions[index] = !expansionState;
                        //TODO: Add popup message
                    } else {
                        $scope.SelectedCivsCount = $scope.SelectedCivsCount - civsInExpansion;
                        $scope.CurrentlyBanned = $scope.CurrentlyBanned + civsInExpansion;
                        if ($scope.CurrentlyBanned == $scope.MaxBannable) {
                            $scope.BannedType = "warning";
                            $scope.showAlert = true;
                        } else {
                            $scope.BannedType = "info"
                            $scope.showAlert = false;
                        }
                    }
                }
            }
        }
    );