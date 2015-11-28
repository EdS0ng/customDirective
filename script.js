'use strict';

var myapp = angular.module('myapp', ['ui.bootstrap']);

myapp.controller('DropdownCtrl', function ($scope) {

  $scope.status = {
    isopen: false
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };
});

myapp.controller('planetCtrl', function ($scope, planetSvc, $rootScope){
  planetSvc.savePlanets(function cb (planets){
    $scope.planets = planets;
  });

  $scope.showPlanet = function (planet){
    console.log(planet);
    $rootScope.$broadcast('PlanetChosen', planet);
  }

  $scope.filterFunc = function (element){
    if ($scope.min===undefined) return element;
    return element.residents.length === $scope.min;
  }
  
})

myapp.controller('cardCtrl', function ($scope, residentSvc, planetSvc){
  $scope.$on('PlanetChosen', function ($event, planet){
    console.log('gotevent');
    $scope.planetName = planet.name;
    $scope.got = false;
    residentSvc.saveResidents(planet.residents, function (residents){
      console.log('saved');
      $scope.got=true;
      $scope.$broadcast('gotResident');
    });
  })
});

myapp.service('residentSvc', function ($http){
  var residents = [];

  this.saveResidents = function (arr, cb){
    arr.forEach(function (x, ind){
      $http.get(x).then(function (resp){
        residents.push(resp.data);
        if (ind === arr.length-1){
          cb();
        }
      })
    })
  }
  this.getResidents = function (){
    return residents;
  }

})

myapp.controller('residentCtrl', function ($scope, residentSvc){
  $scope.recieved = false;
  $scope.$on('gotResident', function ($event){
    $scope.recieved= true;
    console.log('gotresident')
    $scope.residents = residentSvc.getResidents();   
  })
})

myapp.controller('loadCtrl', function (planetSvc, $scope, $interval){
  $scope.resDone = false;
  var stop = $interval(function (){
    var arr = planetSvc.getPlanets();
    if (arr.length===61) {
      $interval.cancel(stop);
      $scope.done=false;
    }else{
      $scope.done = true;
    }
  }, 100);
  
  $scope.$on('PlanetChosen', function (){
    $scope.resDone = true;
  })

})

myapp.service('planetSvc', function ($http){
  var planets =[];

  this.savePlanets = function (cb){
    for (var i=1; i<8;i++){
      $http.get('http://swapi.co/api/planets/?page='+i).then(function (resp){
        planets = planets.concat(resp.data.results);
        if (planets.length===61){
          cb(planets);
        }   
      });
    }
  }

  this.getPlanets = function (){
    return planets;
  }

})

myapp.directive('swapiResident', function (){
  return{
    scope:{},
    templateUrl:'residentList.html',
    controller:'residentCtrl'
  }
})

myapp.directive('swapiPlanet', function (){
  return {
    scope:{},
    templateUrl: 'planetCard.html',
    controller: 'cardCtrl'
  }
})

myapp.directive('swapiPlanetSelector', function (){
  return {
    scope: {
      min:'='
    },
    templateUrl: 'planetList.html',
    controller: 'planetCtrl'
  }
});


