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
        '$rootScope', '$scope', '$stateParams',
        function($rootScope, $scope, $stateParams) {
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
                ["YouTube","Google Inc.", "https://lh5.ggpht.com/jZ8XCjpCQWWZ5GLhbjRAufsw3JXePHUJVfEvMH3D055ghq0dyiSP3YxfSc_czPhtCLSO=w300-rw"],
                ["TechCrunch", "AOL Inc.", "https://lh3.ggpht.com/hXd3jGoc_BlPm_LnlO70HmXQKqnWgYZBpChbLqvzlnwI0-XgxznKN_oGASz9QSo3Vl8=w300-rw"],
                ["Flipboard", "Flipboard", "https://lh4.ggpht.com/bT2W_cLEBJ58KwL3F9N3FfecplkcC4RaB-OFpA120dp8MBfiHOo6W0yXhaY6I5yD7Ck=w300-rw"],
                ["Hotel Tonight", "HotelTonight", "https://lh3.googleusercontent.com/S9OjloXq6cHRtthVAhMrhM-A0zSYyYYwdjJXG77TXLpUjJJ8Qk7sbIkkad2bgGdUfZA=w300-rw"],
                ["Airbnb", "Airbnb, Inc", "https://lh6.ggpht.com/4jnm0-_9TBUdvNtQpefYE0T33a0iAx8AuovO3Uncs1nsSkKhjNc-SbIKFhiSBpYJl5q4=w300-rw"],
                ["Angry Birds", "Rovio Entertainment Ltd.", "https://lh6.ggpht.com/M9q_Zs_CRt2rbA41nTMhrPqiBxhUEUN8Z1f_mn9m89_TiHbIbUF8hjnc_zwevvLsRIJy=w300-rw"],
                ["Stick Hero", "Ketchapp", "https://lh3.ggpht.com/Ph8XvfIqCZNMBH7ltkulP-iqL4OcmSKArZTj99EVhPSXvaIfEotwVQ8Rt-OfNBou3_8B=w300-rw"],
                ["Fancy", "thingd", "https://lh4.ggpht.com/tFqu6Gx6xjemZSicG_xvZqrQGaQcgw4CTZCr-x6EqbE2V-DCp6NpPtml2TKSGodAfpU=w300-rw"],
                ["Vimeo", "Vimeo Mobile", "https://lh3.googleusercontent.com/hIckHVP84kogkZ7yGwlMZD8xPnJBDkS_EntshszgtI4kJK0_uCCpbqcuX0GLnJUvN3k=w300-rw"],
                ["Etsy", "Etsy, Inc", "https://lh4.ggpht.com/xomNZkhkqLxKLV9Gb11fACyLh7DhMDcSPFjYLvilAKbEFZmlwYbmqB3Bu-49h3yi-1A=w300-rw"]
            ];

            $scope.apps = []; 

            $.each(data, function(idx, d) {
                $scope.apps.push(new App(idx + 1, d));
            });

            $scope.playingApp = null;
            $scope.hideApp = function() {
                rdpClient.disconnect();
                $scope.playingApp = null;
                $rootScope.preventScroll = false;
            }
            $scope.showApp = function(appId) {
                $scope.playingApp = $scope.apps[appId - 1];
                $rootScope.preventScroll = true;

                canvas.style.display = 'inline';
                canvas.width = Math.max(window.innerWidth, 800);
                canvas.height = Math.max(window.innerHeight, 600);
                setTimeout(function() {
                    repositionCanvas();
                }, 500);
                rdpClient.connect(
                    CONN_INFO.ip, 
                    CONN_INFO.domain, 
                    CONN_INFO.username, 
                    CONN_INFO.password, 
                    function (err) {
                        if (err) {
                            alert(JSON.stringify(err));
                            rdpClient.disconnect();
                            $scope.playingApp = null;
                            $scope.$apply();
                            $rootScope.preventScroll = false;
                            $rootScope.$apply();
                        }
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
