//var App = angular.module("Siberian", ['ngRoute', 'ngAnimate', 'ngTouch', 'angular-carousel']);
var App = angular.module("Siberian", ['ngRoute', 'ngAnimate', 'ngTouch', 'angular-carousel', 'ngResource', 'ngSanitize']);


App.run(function($rootScope, $window, $location, Connection) {

    FastClick.attach($window.document);

    $rootScope.direction = 'to-right';
    $rootScope.$on('$routeChangeStart', function(event, next, current) {

//        $window.scrollTo(0,0);

        if(!current) {
            $rootScope.direction = 'to-right';
        } else if (current.depth > next.depth) {
            $rootScope.direction = 'to-right';
        } else {
            $rootScope.direction = 'to-left';
        }

    });

    Connection.check();

    $window.addEventListener("online", function() {
        console.log('online');
        Connection.check();
    });

    $window.addEventListener("offline", function() {
        console.log('offline');
        Connection.check();
    });

}).config(function($routeProvider, $locationProvider, $httpProvider) {

    $httpProvider.interceptors.push(function($q, $injector) {
        return {
            responseError: function(response) {
                if(response.status == 0) {
                    $injector.get('Connection').setIsOffline();
                }
                return $q.reject(response);
            }
        };
    });

    $locationProvider.html5Mode(true);
    $routeProvider
        .when(BASE_URL, {
            controller: 'HomeController',
            templateUrl: BASE_URL+"/front/mobile_home/view",
            depth: 0
        })
        .otherwise({
            controller: 'HomeController',
            templateUrl: BASE_URL+"/front/mobile_home/view"
         })
    ;

});

App.directive('backButton', function($window, $location) {
    return {
        restrict: 'A',
        controller: function($scope) {

        },
        link: function (scope, element, attrs, controller) {
            element.bind('click', function () {
                var header = angular.element(document.getElementsByTagName('header'));
                if(header.hasClass('header')) {
                    header.removeClass('animated').css({top: '0px'});
                }
                $window.history.back();
//                $location.path(BASE_URL);
//                scope.$apply();
            });
        }
    };
});

App.directive('sbBackgroundImage', function($http, $window) {
    return {
        restrict: 'A',
        scope: {
            valueId: "="
        },
        link: function (scope, element, attrs) {

            $http({
                method: 'GET',
                url: BASE_URL+'/front/mobile/backgroundimage/value_id/'+scope.valueId,
                cache: true
            }).success(function(url) {
                if(url) {
                    scope.$parent.style_background_image = {"background-image": "url('"+url+"')"};
                }
            });

            scope.onResizeFunction = function() {
                var height = $window.innerHeight;
                var width = $window.innerWidth;
                if(element.hasClass('has_header')) {
                    height -= 42;
                }
                element[0].style.minHeight = height + "px";
                element[0].style.minWidth = width + "px";
            };

            scope.onResizeFunction();

            angular.element($window).bind('resize', function() {
                scope.onResizeFunction();
                scope.$apply();
            });
        }
    };
});


App.factory('Connection', function($rootScope, $window, $http, $timeout) {

    var factory = {};

    factory.isOnline = false;

    factory.setIsOffline = function() {

        if(!$rootScope.isOnline) return;

        $http({ method: "HEAD", url: "/app:setIsOnline:0" });

        this.isOnline = false;
        $rootScope.isOnline = false;

        console.log('offline confirmed');
    }

    factory.setIsOnline = function() {

        if($rootScope.isOnline) return;

        $http({ method: "HEAD", url: "/app:setIsOnline:1" });

        this.isOnline = true;
        $rootScope.isOnline = true;

        console.log('online confirmed');
    }

    factory.check = function () {

        if(!$rootScope.isOnline && !$window.navigator.onLine) {
            return;
        }

        var url = "/check_connection.php?t=" + Date.now();

        $http({ method: 'HEAD', url: url })
            .success(function(response) {
                factory.setIsOnline();
            }).error(function() {
                factory.setIsOffline();
                $timeout(factory.check, 3000);
            });

        return;
    }

    return factory;
});

App.factory("httpCache", function($http, $cacheFactory) {
    return {
        remove: function(url) {
            if(angular.isDefined($cacheFactory.get('$http').get(url))) {
                $cacheFactory.get('$http').remove(url);
            }

            return this;
        }
    }
});

App.factory("Url", function($http, $cacheFactory) {
    return {
        get: function(uri, params) {
            var url = new Array();
            url.push(BASE_URL);
            url.push(uri);
            for(var i in params) {
                url.push(i);
                url.push(params[i]);
            }

            url = url.join('/');
            if(url.substr(0, 1) != "/") url = "/"+url;

            return url;
        }
    }
});

App.factory('Message', function($timeout) {

    var Message = function() {

        this.is_error = false;
        this.text = "";
        this.is_visible = false;

        this.setText = function(text) {
            this.text = text;
            return this;
        };

        this.isError = function(is_error) {
            this.is_error = is_error;
            return this;
        };

        this.show = function() {
            this.is_visible = true;
            $timeout(function() {
                this.is_visible = false;
            }.bind(this), 4000);

            return this;
        }

    }

    return Message;

});

App.directive('sbHeader', function() {
    return {
        restrict: 'E',
        template: '<header class="page_header"><div class="header absolute scale-fade" ng-show="!message.is_visible"><button type="button" class="btn_back header no-background" back-button><div class="back_arrow header"></div><span>{{ title_back }}</span></button><p class="title">{{ title }}</p></div><div class="message scale-fade" ng-show="message.is_visible"><p ng-class="{error: message.is_error, header: !message.is_error}">{{ message.text }}</p></div></header>',
        replace: true,
        scope: {
            title_back: '=titleBack',
            title: '=',
            message: '='
        }
    }
});


App.directive('sbLoader', function() {
    return {
        restrict: 'E',
        scope: {
            has_connection: '=hasConnection',
            is_loading: '=isLoading'
        },
        template: '<div class="toggle" ng-show="is_loading || !has_connection"><div ng-if="is_loading" class="loader"></div><div ng-show="!has_connection" class="no_connection">You are working offline</div></div>',
        replace: true
    };
});


var ajaxComplete = function(data) {

};


