var APP = (function(app) {
    var app = angular.module('hailstone', [
            // default include
            'ngCookies',
            'ui.router',
            'ui.bootstrap',
            'oc.lazyLoad',
            'hsControllers',
            'hsConstants'
        ]);

    app.config(['$provide', function($provide) {
        $provide.decorator('$state', function($delegate, $stateParams) {
            $delegate.forceReload = function() {
                return $delegate.go($delegate.current, $stateParams, {
                    reload:true, 
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });
    }]);

    app.config([
        '$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {

            $locationProvider.html5Mode(true);
            $urlRouterProvider.otherwise(function($injector, $location) {
                var $state = $injector.get('$state');
                window.location = '/404?url=' + encodeURIComponent($location.$$url);
            });

            $urlRouterProvider.rule(function($injector, $location) {
                var re = /(.+)(\/+)(\?.*)?/;
                var path = $location.url();

                if (re.test(path)) {
                    return path.replace(re, '$1$3')
                }

                return false;
            });

            $stateProvider
                .state('defaultApp', {
                    abstract: true,
                    controller: 'DefaultFrame',
                    template:'<div ui-view/>'
                })

                .state('app', {
                    parent: 'defaultApp',
                    abstract: true,
                    controller: 'AppFrame',
                    templateUrl: 'partials/frame_root.html'
                })

                .state('pageHome', {
                    parent: 'app',
                    url: '/',
                    templateUrl: 'partials/page_home.html',
                    controller: 'PageHome'
                })

                .state('page404', {
                    parent: 'app',
                    url: '/404?url',
                    templateUrl: 'partials/page_404.html',
                    controller: 'Page404'
                })

                .state('page500', {
                    parent: 'app',
                    url: '/500',
                    templateUrl: 'partials/page_500.html',
                    controller: 'Page500'
                });

        }]);

    return app; 
}(window['APP']));
