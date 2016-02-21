(function() {
    var module = angular.module('hsConstants', []);

    function endpoint(host, prefix, path) {
        var url;
        
        if (!prefix && !path) {
            return function(prefix, path) {
                return endpoint(host, prefix, path);
            };
        }

        if (!path) {
            return function(path) {
                return endpoint(host, prefix, path);
            }
        }

        url = host;
        if (!url.endsWith('/')) {
            url += '/';
        }
        url += prefix;
        if (path) {
            url += '/' + path;
        }
        if (!url.endsWith('/')) {
            url += '/';
        }
        return url;
    }

    module.constant('apiPaths', (function() {
        var host = '',
            apiEndPoint = endpoint('', 'api/v1');

        return {
        };
    }()));
}());
