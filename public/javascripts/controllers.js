(function() {
    var module = angular.module('hsControllers', []);
    
    module.controller('Global', [
        '$rootScope', '$scope', '$state',
        function($rootScope, $scope, $state) {
            
            $rootScope.context = {};
            $rootScope.bodyClass = [];

            $rootScope.addBodyClass = function() {
                var args = Array.prototype.slice.call(arguments);            
                angular.forEach(args, function(val) {
                    if ($rootScope.bodyClass.indexOf(val) === -1) {
                        $rootScope.bodyClass.push(val);
                    }
                });
            };

            $rootScope.removeBodyClass = function() {
                var args = Array.prototype.slice.call(arguments);            
                angular.forEach(args, function(val) {
                    var idx = $rootScope.bodyClass.indexOf(val);
                    if (idx > -1) {
                        $rootScope.bodyClass.splice(idx, 1);
                    }
                });
            };

        }]);

    module.controller('DefaultFrame', [
        '$rootScope', '$scope', '$state',
        function($rootScope, $scope, $state) {
            var getContentsHeight;

            function setContentHeight() {
                var footer = $('footer.footer-section');
                if (footer.is(':visible')) {
                    $scope.minContentsHeight = $(window).height() - footer.outerHeight();
                } else {
                    $scope.minContentsHeight = $(window).height();
                }
            }

            setContentHeight();

            $(window).on('resize.frame', function(e) {
                setContentHeight();
                $scope.$apply();
            });

            $rootScope.$on('frameRendered', function() {
                setContentHeight();
            });

            $scope.$on('$destroy', function() {
                $(window).off('resize.frame');
            });
        }]);

    module.controller('AppFrame', [
        '$rootScope', '$scope',
        function($rootScope, $scope) {
            $rootScope.$broadcast('frameRendered');
        }]);

    module.controller('PageHome', [
        '$rootScope', '$scope', '$stateParams', '$http',
        function($rootScope, $scope, $stateParams, $http) {

            var _executeTimer = null;
            var _pingTimer = null;
            var _pingInterval = null;
            var canvasId = 'app-canvas';
            var canvas = Mstsc.$(canvasId);
            //360x532
            var rdpClient = Mstsc.client.create(canvas);
            var CONN_INFO = {
                ip: '112.169.127.123',
                domain: 'staging.hailstone.io',
                username: '',
                password: ''
            };

            function repositionCanvas() {
                var canvas = $('#app-canvas');
                canvas.css('marginLeft', -1 * canvas.width() / 2);
                canvas.css('marginTop', -1 * canvas.height() / 2);
            }

            $(window).on('resize.home', repositionCanvas);

            $rootScope.pageTitle = 'Home';
            $rootScope.preventScroll = false;
            
            var data = [
                ["YouTube","Google Inc.", "/public/images/wish.JPG"],
                ["TechCrunch", "AOL Inc.", "/public/images/techcrunch.JPG"],
                ["Flipboard", "Flipboard", "/public/images/flipboard.JPG"],
                ["Hotel Tonight", "HotelTonight", "/public/images/hoteltonight.JPG"],
                ["Airbnb", "Airbnb, Inc", "/public/images/airbnb.JPG"],
                ["Angry Birds", "Rovio Entertainment Ltd.", "/public/images/angrybirds.JPG"],
                ["Stick Hero", "Ketchapp", "/public/images/stickhero.JPG"],
                ["Fancy", "thingd", "/public/images/fancy.JPG"],
                ["Vimeo", "Vimeo Mobile", "/public/images/vimeo.JPG"],
                ["Etsy", "Etsy, Inc", "/public/images/etsy.JPG"],
                ["CNET", "", "/public/images/cnet.JPG"],
                ["Duolingo Learn Languages Free", "", "/public/images/duolingo.JPG"],
                ["Fitbit", "", "/public/images/fitbit.JPG"],
                ["Goal live scores", "", "/public/images/goalscore.JPG"],
                ["Marvel Comics", "", "/public/images/marvelavengers.JPG"],
                ["Shazam", "", "/public/images/shazam.JPG"],
                ["Soundcloud", "", "/public/images/soundcloud.JPG"],
                ["Avengers Iron Man Mark VII", "", "/public/images/marvelavengers.JPG"],
                ["Twilight", "", "/public/images/twilight.JPG"],
                ["Wish", "", "/public/images/wish.JPG"],
            ];

            $scope.apps = []; 

            $.each(data, function(idx, d) {
                $scope.apps.push(new App(idx + 1, d));
            });

            $.each($scope.apps, function(idx, app) {
                $scope.apps.push(app);
            });

            $scope.playingApp = null;
            $scope.hideApp = function() {
                disconnect();
            }

            $scope.showApp = function(appId) {
                $scope.showProgress = true;
                $http({
                    method:'GET',
                    url: '/api/vm/acquire/'
                }).then(function(response) {
                    $scope.showProgress = false;
                    if (!response.data || response.data.split(',').length < 2) {
                        alert('Failed to acquire machine. Invalid response.');
                        return;
                    }

                    var token = response.data.split(',');

                    $scope.playingApp = $scope.apps[appId - 1];
                    $rootScope.preventScroll = true;

                    canvas.style.display = 'inline';
                    canvas.width = Math.max(window.innerWidth, 800);
                    canvas.height = Math.max(window.innerHeight, 600);
                    setTimeout(function() {
                        repositionCanvas();
                    }, 500);

                    rdpClient._vmName = token[0];
                    rdpClient.connect(
                        CONN_INFO.ip, 
                        token[1],
                        CONN_INFO.domain, 
                        CONN_INFO.username, 
                        CONN_INFO.password, 
                        function() {
                            executeApp($scope.apps[appId - 1], 60);
                            ping();
                        }, function (err) {
                            disconnect(err);
                            $scope.$apply();
                            $rootScope.$apply();
                        });

                }, function(response) {
                    $scope.showProgress = false;
                    alert('Failed to acquire machine. Please try again later.');
                    disconnect();
                });
            };

            function App(id, data) {
                this.id = id;
                this.name = data[0];
                this.company = data[1];
                this.thumbUrl = data[2];

                this.play = function() {
                    $scope.showApp(id);
                };
            }

            function disconnect(err) {
                if (err) {
                    alert('Failed to connect to server');
                }
                if (_executeTimer) {
                    clearTimeout(_executeTimer);
                }

                if (_pingTimer) {
                    clearTimeout(_pingTimer);
                }
                rdpClient.disconnect();
                $scope.playingApp = null;
                $rootScope.preventScroll = false;

                if (rdpClient._vmName) {
                    $http.get('/api/vm/release/', {
                        params: {
                            name: rdpClient._vmName
                        }
                    });
                    rdpClient._vmName = null;
                }
            }

            function ping() {
                if (!rdpClient._vmName) {
                    return;
                }
                if (_pingTimer) {
                    clearTimeout(_pingTimer);
                }
                $http.get('/api/vm/ping/', {
                    params: {
                        name:rdpClient._vmName
                    }
                }).then(function() {
                    _pingTimer = setTimeout(function() {
                        ping();
                    }, 30000);
                });
            }

            function executeApp(app, count) {
                if (_executeTimer) {
                    clearTimeout(_executeTimer);
                }
                if (!rdpClient._vmName) {
                    return;
                }
                $http({
                    method:'GET',
                    url:'/api/vm/execute/',
                    params: {
                        name:rdpClient._vmName,
                        idx: app.id - 1
                    }
                }).then(function(response) {
                    if (count > 0) {
                        _executeTimer = setTimeout(function() {
                            executeApp(app, count - 1);
                        }, 1000);
                    }
                }, function(response) {

                });
            }

        }]);

    module.controller('Page404', [
        '$rootScope', '$scope', '$stateParams',
        function($rootScope, $scope, $stateParams) {
            $rootScope.pageTitle = 'Page not found';
            $scope.originalUrl = $stateParams.url ? decodeURIComponent($stateParams.url) : null;
        }]);

    module.controller('Page500', [
        '$rootScope', '$scope', '$stateParams',
        function($rootScope, $scope, $stateParams) {
            $rootScope.pageTitle = 'Internal server error';
        }]);

    return module;
}());
