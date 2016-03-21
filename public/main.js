'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});

app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope, FullstackPics) {

    // Images of beautiful Fullstack people.
    $scope.images = _.shuffle(FullstackPics);
});
app.config(function ($stateProvider) {
    $stateProvider.state('docs', {
        url: '/docs',
        templateUrl: 'js/docs/docs.html'
    });
});

(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function () {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function (fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            if (this.isAuthenticated() && fromServer !== true) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin)['catch'](function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin)['catch'](function () {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        })['catch'](function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});
app.controller('LoopController', function ($scope, LoopFactory) {

    LoopFactory.initialize();

    $scope.playing = false;

    $scope.toggle = function () {
        if ($scope.playing) {
            Tone.Transport.stop();
            $scope.playing = false;
        } else {
            Tone.Transport.start();
            $scope.playing = true;
        }
    };

    $scope.deleteSelected = LoopFactory.deleteNote;

    $scope.saveLoop = LoopFactory.save;
});

'use strict';

app.factory('LoopFactory', function ($http) {
    var LoopFactory = {};

    var canvas;
    var synth = new Tone.PolySynth(16, Tone.SimpleSynth, {
        "oscillator": {
            "partials": [0, 2, 3, 4]
        },
        "volume": -12
    }).toMaster();

    // initialize looping
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = "0:0:0";
    Tone.Transport.loopEnd = "0:4:0";

    // intialize Transport event timeline tracking
    var lastEvent = null;
    var lastObjId = 16;

    var loopMusicData = {};

    function getPitchStr(yVal) {
        if (yVal >= 0 && yVal < 40) return "c5";
        if (yVal >= 40 && yVal < 80) return "b4";
        if (yVal >= 80 && yVal < 120) return "a4";
        if (yVal >= 120 && yVal < 160) return "g4";
        if (yVal >= 160 && yVal < 200) return "f4";
        if (yVal >= 200 && yVal < 240) return "e4";
        if (yVal >= 240 && yVal < 280) return "d4";
        if (yVal >= 280 && yVal < 320) return "c4";
    }

    function getBeatStr(xVal) {
        if (xVal >= 0 && xVal < 40) return "0:0:0";
        if (xVal >= 40 && xVal < 80) return "0:0:2";
        if (xVal >= 80 && xVal < 120) return "0:1:0";
        if (xVal >= 120 && xVal < 160) return "0:1:2";
        if (xVal >= 160 && xVal < 200) return "0:2:0";
        if (xVal >= 200 && xVal < 240) return "0:2:2";
        if (xVal >= 240 && xVal < 280) return "0:3:0";
        if (xVal >= 280 && xVal < 320) return "0:3:2";
    }

    function scheduleTone(objX, objY, newObjectId) {
        var pitch = getPitchStr(objY);
        var duration = "8n";
        var startTime = getBeatStr(objX);
        var eventId = Tone.Transport.schedule(function () {
            synth.triggerAttackRelease(pitch, duration);
        }, startTime);
        loopMusicData[newObjectId] = { pitch: pitch, duration: duration, startTime: startTime };
        return eventId;
    }

    LoopFactory.initialize = function () {

        // initialize canvas for a 8 * 8 grid
        canvas = new fabric.Canvas('c', {
            selection: false
        });
        canvas.setHeight(320);
        canvas.setWidth(320);
        canvas.renderAll();
        var grid = 40;

        // draw lines on grid
        for (var i = 0; i < 320 / grid; i++) {
            canvas.add(new fabric.Line([i * grid, 0, i * grid, 320], { stroke: '#ccc', selectable: false }));
            canvas.add(new fabric.Line([0, i * grid, 320, i * grid], { stroke: '#ccc', selectable: false }));
        }

        // create a new rectangle obj on mousedown in canvas area
        // change this to a double-click event (have to add a listener)?
        canvas.on('mouse:down', LoopFactory.addNote);

        // snap to grid when moving obj (doesn't work when resizing):
        canvas.on('object:modified', LoopFactory.snapToGrid);
    };

    LoopFactory.snapToGrid = function (options) {
        console.log("options", options);
        console.log('options target', options.target);
        options.target.set({
            left: Math.round(options.target.left / grid) * grid,
            top: Math.round(options.target.top / grid) * grid
        });
        var idC = canvas.getActiveObject().id;
        var noteToDelete = loopMusicData[idC];
        delete loopMusicData[idC];

        //delete old event
        Tone.Transport.clear(idC - 16);
        lastEvent <= 0 ? lastEvent = null : lastEvent--;
        //make new one
        var xVal = Math.ceil(options.target.oCoords.tl.x);
        if (xVal < 0) xVal = 0;
        var yVal = Math.ceil(options.target.oCoords.tl.y);
        if (yVal < 0) yVal = 0;
        // console.log("x: ", xVal, "y: ", yVal)
        var newObjectId = newEventId + 16;
        var newEventId = scheduleTone(xVal, yVal, newObjectId);
        // console.log("newEventId: ", newEventId);
        newIdC = canvas.getActiveObject().set('id', newObjectId);
        // console.log("new objId: ", newIdC);
    };

    LoopFactory.addNote = function (options) {
        if (options.target) {
            synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
            return;
        }

        var newObjectId = lastObjId++;

        canvas.add(new fabric.Rect({
            id: newObjectId,
            left: Math.floor(options.e.offsetX / 40) * 40,
            right: Math.floor(options.e.offsetX / 40) * 40,
            top: Math.floor(options.e.offsetY / 40) * 40,
            width: 40,
            height: 40,
            fill: '#faa',
            originX: 'left',
            originY: 'top',
            centeredRotation: true,
            minScaleLimit: 0,
            lockScalingY: true,
            lockScalingFlip: true,
            hasRotatingPoint: false
        }));

        var newItem = canvas.item(newObjectId);
        canvas.setActiveObject(newItem);
        // console.log('id of new obj: ', canvas.getActiveObject().get('id'));

        // sound tone when clicking, and schedule
        synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
        // console.log('options e from 124', options.e)
        var eventId = scheduleTone(options.e.offsetX, options.e.offsetY, newObjectId);
        // console.log('id of new transport evt: ', eventId);

        //increment last event for clear button
        lastEvent === null ? lastEvent = 0 : lastEvent++;
    };

    LoopFactory.deleteNote = function () {
        var selectedObjectId = canvas.getActiveObject().id;
        canvas.getActiveObject().remove();
        lastObjId--;
        // also delete tone event:
        Tone.Transport.clear(selectedObjectId - 16);
        // delete from JSON data store
        delete loopMusicData[selectedObjectId];
        lastEvent <= 0 ? lastEvent = null : lastEvent--;
    };

    LoopFactory.save = function () {
        var dataToSave = [];
        for (var i in loopMusicData) {
            dataToSave.push(loopMusicData[i]);
        }
        $http.post('/api/loops', dataToSave);
    };

    return LoopFactory;
});
app.config(function ($stateProvider) {

    $stateProvider.state('loop', {
        url: '/loop',
        controller: 'LoopController',
        templateUrl: 'js/loop/loop.html'
    }).state('loops', {
        url: '/loops',
        templateUrl: 'js/loop/loops.html'
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/members-area',
        template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
        controller: function controller($scope, SecretStash) {
            SecretStash.getStash().then(function (stash) {
                $scope.stash = stash;
            });
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });
});

app.factory('SecretStash', function ($http) {

    var getStash = function getStash() {
        return $http.get('/api/members/secret-stash').then(function (response) {
            return response.data;
        });
    };

    return {
        getStash: getStash
    };
});
app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});

app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'about' }, { label: 'Documentation', state: 'docs' }, { label: 'Members Only', state: 'membersOnly', auth: true }];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});

app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvb3AvbG9vcC5jb250cm9sbGVyLmpzIiwibG9vcC9sb29wLmZhY3RvcnkuanMiLCJsb29wL2xvb3Auc3RhdGUuanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQ2xEQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ0xBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsZUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGdCQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsV0FBQSxDQUFBLFVBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDbkJBLFlBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxnQkFBQSxFQUFBLENBQUEsRUFBQTtLQUNBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsT0FBQSxDQUFBOzs7QUFHQSxRQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxhQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGFBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLENBQUEsSUFBQSxJQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsRUFBQSxJQUFBLElBQUEsR0FBQSxFQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxFQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsSUFBQSxHQUFBLEVBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEVBQUEsSUFBQSxJQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsRUFBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxPQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxPQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxZQUFBLEtBQUEsR0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBO0FBQ0EsaUJBQUEsQ0FBQSxvQkFBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtTQUNBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxDQUFBO0tBQ0E7O0FBRUEsZUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBOzs7QUFHQSxjQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLEVBQUEsS0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFHQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0E7Ozs7QUFJQSxjQUFBLENBQUEsRUFBQSxDQUFBLFlBQUEsRUFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsRUFBQSxXQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLGVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLFlBQUEsR0FBQSxhQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxlQUFBLGFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTs7O0FBR0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsU0FBQSxHQUFBLElBQUEsR0FBQSxTQUFBLEVBQUEsQ0FBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLFdBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOztLQUVBLENBQUE7O0FBRUEsZUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLFlBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsb0JBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBO1NBQ0E7O0FBRUEsWUFBQSxXQUFBLEdBQUEsU0FBQSxFQUFBLENBQUE7O0FBRUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLEVBQUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBO0FBQ0EsbUJBQUEsRUFBQSxNQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0FBQ0EsNEJBQUEsRUFBQSxJQUFBO0FBQ0EseUJBQUEsRUFBQSxDQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO0FBQ0EsMkJBQUEsRUFBQSxJQUFBO0FBQ0EsNEJBQUEsRUFBQSxLQUFBO1NBQ0EsQ0FBQSxDQUNBLENBQUE7O0FBRUEsWUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxhQUFBLENBQUEsb0JBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLEVBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLEVBQUEsV0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxpQkFBQSxLQUFBLElBQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxHQUFBLFNBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxlQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLGdCQUFBLEdBQUEsTUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLGVBQUEsYUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxHQUFBLFNBQUEsR0FBQSxJQUFBLEdBQUEsU0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLGVBQUEsQ0FBQSxJQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzNLQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxPQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxvQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ1pBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxnQkFBQSxFQUFBLG1FQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7O0FBR0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFFBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDL0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQ0EsdURBQUEsRUFDQSxxSEFBQSxFQUNBLGlEQUFBLEVBQ0EsaURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDN0JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBOztBQUVBLFFBQUEsa0JBQUEsR0FBQSxTQUFBLGtCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsU0FBQSxHQUFBLENBQ0EsZUFBQSxFQUNBLHVCQUFBLEVBQ0Esc0JBQUEsRUFDQSx1QkFBQSxFQUNBLHlEQUFBLEVBQ0EsMENBQUEsRUFDQSxjQUFBLEVBQ0EsdUJBQUEsRUFDQSxJQUFBLEVBQ0EsaUNBQUEsRUFDQSwwREFBQSxFQUNBLDZFQUFBLENBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxTQUFBO0FBQ0EseUJBQUEsRUFBQSw2QkFBQTtBQUNBLG1CQUFBLGtCQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDNUJBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDL0NBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsZUFBQSxFQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLHlEQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pOyIsImFwcC5jb250cm9sbGVyKCdMb29wQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIExvb3BGYWN0b3J5KSB7XG5cbiAgTG9vcEZhY3RvcnkuaW5pdGlhbGl6ZSgpO1xuXG4gICRzY29wZS5wbGF5aW5nID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucGxheWluZykge1xuICAgICAgVG9uZS5UcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgJHNjb3BlLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgVG9uZS5UcmFuc3BvcnQuc3RhcnQoKTtcbiAgICAgICRzY29wZS5wbGF5aW5nID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlU2VsZWN0ZWQgPSBMb29wRmFjdG9yeS5kZWxldGVOb3RlO1xuXG4gICRzY29wZS5zYXZlTG9vcCA9IExvb3BGYWN0b3J5LnNhdmU7XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbmFwcC5mYWN0b3J5KCdMb29wRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcbiAgdmFyIExvb3BGYWN0b3J5ID0ge307XG5cbiAgdmFyIGNhbnZhcztcbiAgdmFyIHN5bnRoID0gbmV3IFRvbmUuUG9seVN5bnRoKDE2LCBUb25lLlNpbXBsZVN5bnRoLCB7XG4gICAgICAgICAgICBcIm9zY2lsbGF0b3JcIiA6IHtcbiAgICAgICAgICAgICAgICBcInBhcnRpYWxzXCIgOiBbMCwgMiwgMywgNF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ2b2x1bWVcIiA6IC0xMlxuICAgICAgICB9KS50b01hc3RlcigpO1xuICBcbiAgLy8gaW5pdGlhbGl6ZSBsb29waW5nXG4gIFRvbmUuVHJhbnNwb3J0Lmxvb3AgPSB0cnVlO1xuICBUb25lLlRyYW5zcG9ydC5sb29wU3RhcnQgPSBcIjA6MDowXCI7XG4gIFRvbmUuVHJhbnNwb3J0Lmxvb3BFbmQgPSBcIjA6NDowXCI7XG4gIFxuICAvLyBpbnRpYWxpemUgVHJhbnNwb3J0IGV2ZW50IHRpbWVsaW5lIHRyYWNraW5nXG4gIHZhciBsYXN0RXZlbnQgPSBudWxsO1xuICB2YXIgbGFzdE9iaklkID0gMTY7XG5cbiAgdmFyIGxvb3BNdXNpY0RhdGEgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRQaXRjaFN0ciAoeVZhbCkge1xuICAgIGlmICh5VmFsID49IDAgJiYgeVZhbCA8IDQwKSByZXR1cm4gXCJjNVwiO1xuICAgIGlmICh5VmFsID49IDQwICYmIHlWYWwgPCA4MCkgcmV0dXJuIFwiYjRcIjtcbiAgICBpZiAoeVZhbCA+PSA4MCAmJiB5VmFsIDwgMTIwKSByZXR1cm4gXCJhNFwiO1xuICAgIGlmICh5VmFsID49IDEyMCAmJiB5VmFsIDwgMTYwKSByZXR1cm4gXCJnNFwiO1xuICAgIGlmICh5VmFsID49IDE2MCAmJiB5VmFsIDwgMjAwKSByZXR1cm4gXCJmNFwiO1xuICAgIGlmICh5VmFsID49IDIwMCAmJiB5VmFsIDwgMjQwKSByZXR1cm4gXCJlNFwiO1xuICAgIGlmICh5VmFsID49IDI0MCAmJiB5VmFsIDwgMjgwKSByZXR1cm4gXCJkNFwiO1xuICAgIGlmICh5VmFsID49IDI4MCAmJiB5VmFsIDwgMzIwKSByZXR1cm4gXCJjNFwiO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QmVhdFN0ciAoeFZhbCkge1xuICAgIGlmICh4VmFsID49IDAgJiYgeFZhbCA8IDQwKSByZXR1cm4gXCIwOjA6MFwiO1xuICAgIGlmICh4VmFsID49IDQwICYmIHhWYWwgPCA4MCkgcmV0dXJuIFwiMDowOjJcIjtcbiAgICBpZiAoeFZhbCA+PSA4MCAmJiB4VmFsIDwgMTIwKSByZXR1cm4gXCIwOjE6MFwiO1xuICAgIGlmICh4VmFsID49IDEyMCAmJiB4VmFsIDwgMTYwKSByZXR1cm4gXCIwOjE6MlwiO1xuICAgIGlmICh4VmFsID49IDE2MCAmJiB4VmFsIDwgMjAwKSByZXR1cm4gXCIwOjI6MFwiO1xuICAgIGlmICh4VmFsID49IDIwMCAmJiB4VmFsIDwgMjQwKSByZXR1cm4gXCIwOjI6MlwiO1xuICAgIGlmICh4VmFsID49IDI0MCAmJiB4VmFsIDwgMjgwKSByZXR1cm4gXCIwOjM6MFwiO1xuICAgIGlmICh4VmFsID49IDI4MCAmJiB4VmFsIDwgMzIwKSByZXR1cm4gXCIwOjM6MlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGVUb25lIChvYmpYLCBvYmpZLCBuZXdPYmplY3RJZCkge1xuICAgIHZhciBwaXRjaCA9IGdldFBpdGNoU3RyKG9ialkpO1xuICAgIHZhciBkdXJhdGlvbiA9IFwiOG5cIjtcbiAgICB2YXIgc3RhcnRUaW1lID0gZ2V0QmVhdFN0cihvYmpYKTtcbiAgICB2YXIgZXZlbnRJZCA9IFRvbmUuVHJhbnNwb3J0LnNjaGVkdWxlKGZ1bmN0aW9uKCl7XG4gICAgICBzeW50aC50cmlnZ2VyQXR0YWNrUmVsZWFzZShwaXRjaCwgZHVyYXRpb24pO1xuICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgbG9vcE11c2ljRGF0YVtuZXdPYmplY3RJZF0gPSB7cGl0Y2g6IHBpdGNoLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0YXJ0VGltZTogc3RhcnRUaW1lfTtcbiAgICByZXR1cm4gZXZlbnRJZDtcbiAgfVxuXG4gIExvb3BGYWN0b3J5LmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIGluaXRpYWxpemUgY2FudmFzIGZvciBhIDggKiA4IGdyaWRcbiAgICBjYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcygnYycsIHsgXG4gICAgICAgIHNlbGVjdGlvbjogZmFsc2VcbiAgICAgIH0pO1xuICAgIGNhbnZhcy5zZXRIZWlnaHQoMzIwKTtcbiAgICBjYW52YXMuc2V0V2lkdGgoMzIwKTtcbiAgICBjYW52YXMucmVuZGVyQWxsKCk7XG4gICAgdmFyIGdyaWQgPSA0MDtcblxuICAgIC8vIGRyYXcgbGluZXMgb24gZ3JpZFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKDMyMCAvIGdyaWQpOyBpKyspIHtcbiAgICAgIGNhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFsgaSAqIGdyaWQsIDAsIGkgKiBncmlkLCAzMjBdLCB7IHN0cm9rZTogJyNjY2MnLCBzZWxlY3RhYmxlOiBmYWxzZSB9KSk7XG4gICAgICBjYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbIDAsIGkgKiBncmlkLCAzMjAsIGkgKiBncmlkXSwgeyBzdHJva2U6ICcjY2NjJywgc2VsZWN0YWJsZTogZmFsc2UgfSkpXG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IHJlY3RhbmdsZSBvYmogb24gbW91c2Vkb3duIGluIGNhbnZhcyBhcmVhXG4gICAgLy8gY2hhbmdlIHRoaXMgdG8gYSBkb3VibGUtY2xpY2sgZXZlbnQgKGhhdmUgdG8gYWRkIGEgbGlzdGVuZXIpP1xuICAgIGNhbnZhcy5vbignbW91c2U6ZG93bicsIExvb3BGYWN0b3J5LmFkZE5vdGUpXG5cbiAgICAvLyBzbmFwIHRvIGdyaWQgd2hlbiBtb3Zpbmcgb2JqIChkb2Vzbid0IHdvcmsgd2hlbiByZXNpemluZyk6XG4gICAgY2FudmFzLm9uKCdvYmplY3Q6bW9kaWZpZWQnLCBMb29wRmFjdG9yeS5zbmFwVG9HcmlkIClcblxuICB9XG5cbiAgTG9vcEZhY3Rvcnkuc25hcFRvR3JpZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwib3B0aW9uc1wiLCBvcHRpb25zKVxuICAgICAgY29uc29sZS5sb2coJ29wdGlvbnMgdGFyZ2V0Jywgb3B0aW9ucy50YXJnZXQpXG4gICAgICBvcHRpb25zLnRhcmdldC5zZXQoe1xuICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKG9wdGlvbnMudGFyZ2V0LmxlZnQgLyBncmlkKSAqIGdyaWQsXG4gICAgICAgIHRvcDogTWF0aC5yb3VuZChvcHRpb25zLnRhcmdldC50b3AgLyBncmlkKSAqIGdyaWRcbiAgICAgIH0pO1xuICAgICAgdmFyIGlkQyA9IGNhbnZhcy5nZXRBY3RpdmVPYmplY3QoKS5pZFxuICAgICAgdmFyIG5vdGVUb0RlbGV0ZSA9IGxvb3BNdXNpY0RhdGFbaWRDXTtcbiAgICAgIGRlbGV0ZSBsb29wTXVzaWNEYXRhW2lkQ107XG4gICAgICBcbiAgICAgIC8vZGVsZXRlIG9sZCBldmVudFxuICAgICAgVG9uZS5UcmFuc3BvcnQuY2xlYXIoaWRDIC0gMTYpO1xuICAgICAgbGFzdEV2ZW50IDw9IDAgPyBsYXN0RXZlbnQgPSBudWxsIDogbGFzdEV2ZW50LS07XG4gICAgICAvL21ha2UgbmV3IG9uZVxuICAgICAgdmFyIHhWYWwgPSBNYXRoLmNlaWwob3B0aW9ucy50YXJnZXQub0Nvb3Jkcy50bC54KVxuICAgICAgaWYoeFZhbCA8IDApIHhWYWwgPSAwO1xuICAgICAgdmFyIHlWYWwgPSBNYXRoLmNlaWwob3B0aW9ucy50YXJnZXQub0Nvb3Jkcy50bC55KVxuICAgICAgaWYoeVZhbCA8IDApIHlWYWwgPSAwO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ4OiBcIiwgeFZhbCwgXCJ5OiBcIiwgeVZhbClcbiAgICAgIHZhciBuZXdPYmplY3RJZCA9IG5ld0V2ZW50SWQgKyAxNjtcbiAgICAgIHZhciBuZXdFdmVudElkID0gc2NoZWR1bGVUb25lKHhWYWwsIHlWYWwsIG5ld09iamVjdElkKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwibmV3RXZlbnRJZDogXCIsIG5ld0V2ZW50SWQpO1xuICAgICAgbmV3SWRDID0gY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpLnNldCgnaWQnLCBuZXdPYmplY3RJZCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIm5ldyBvYmpJZDogXCIsIG5ld0lkQyk7XG4gIH1cblxuICBMb29wRmFjdG9yeS5hZGROb3RlID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICBzeW50aC50cmlnZ2VyQXR0YWNrUmVsZWFzZShnZXRQaXRjaFN0cihvcHRpb25zLmUub2Zmc2V0WSksIFwiOG5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld09iamVjdElkID0gbGFzdE9iaklkKys7XG5cbiAgICBjYW52YXMuYWRkKG5ldyBmYWJyaWMuUmVjdCh7XG4gICAgICAgIGlkOiBuZXdPYmplY3RJZCxcbiAgICAgICAgbGVmdDogTWF0aC5mbG9vcihvcHRpb25zLmUub2Zmc2V0WCAvIDQwKSAqIDQwLFxuICAgICAgICByaWdodDogTWF0aC5mbG9vcihvcHRpb25zLmUub2Zmc2V0WCAvIDQwKSAqIDQwLFxuICAgICAgICB0b3A6IE1hdGguZmxvb3Iob3B0aW9ucy5lLm9mZnNldFkgLyA0MCkgKiA0MCxcbiAgICAgICAgd2lkdGg6IDQwLCBcbiAgICAgICAgaGVpZ2h0OiA0MCwgXG4gICAgICAgIGZpbGw6ICcjZmFhJywgXG4gICAgICAgIG9yaWdpblg6ICdsZWZ0JywgXG4gICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICBjZW50ZXJlZFJvdGF0aW9uOiB0cnVlLFxuICAgICAgICBtaW5TY2FsZUxpbWl0OiAwLFxuICAgICAgICBsb2NrU2NhbGluZ1k6IHRydWUsXG4gICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2VcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHZhciBuZXdJdGVtID0gY2FudmFzLml0ZW0obmV3T2JqZWN0SWQpO1xuICAgIGNhbnZhcy5zZXRBY3RpdmVPYmplY3QobmV3SXRlbSk7XG4gICAgLy8gY29uc29sZS5sb2coJ2lkIG9mIG5ldyBvYmo6ICcsIGNhbnZhcy5nZXRBY3RpdmVPYmplY3QoKS5nZXQoJ2lkJykpO1xuXG4gICAgLy8gc291bmQgdG9uZSB3aGVuIGNsaWNraW5nLCBhbmQgc2NoZWR1bGVcbiAgICBzeW50aC50cmlnZ2VyQXR0YWNrUmVsZWFzZShnZXRQaXRjaFN0cihvcHRpb25zLmUub2Zmc2V0WSksIFwiOG5cIik7XG4gICAgLy8gY29uc29sZS5sb2coJ29wdGlvbnMgZSBmcm9tIDEyNCcsIG9wdGlvbnMuZSlcbiAgICB2YXIgZXZlbnRJZCA9IHNjaGVkdWxlVG9uZShvcHRpb25zLmUub2Zmc2V0WCwgb3B0aW9ucy5lLm9mZnNldFksIG5ld09iamVjdElkKTtcbiAgICAvLyBjb25zb2xlLmxvZygnaWQgb2YgbmV3IHRyYW5zcG9ydCBldnQ6ICcsIGV2ZW50SWQpO1xuXG4gICAgLy9pbmNyZW1lbnQgbGFzdCBldmVudCBmb3IgY2xlYXIgYnV0dG9uXG4gICAgbGFzdEV2ZW50ID09PSBudWxsID8gbGFzdEV2ZW50ID0gMCA6IGxhc3RFdmVudCsrO1xuICB9XG5cbiAgTG9vcEZhY3RvcnkuZGVsZXRlTm90ZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHNlbGVjdGVkT2JqZWN0SWQgPSBjYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCkuaWQ7XG4gICAgY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpLnJlbW92ZSgpO1xuICAgIGxhc3RPYmpJZC0tO1xuICAgIC8vIGFsc28gZGVsZXRlIHRvbmUgZXZlbnQ6XG4gICAgVG9uZS5UcmFuc3BvcnQuY2xlYXIoc2VsZWN0ZWRPYmplY3RJZC0xNik7XG4gICAgLy8gZGVsZXRlIGZyb20gSlNPTiBkYXRhIHN0b3JlXG4gICAgZGVsZXRlIGxvb3BNdXNpY0RhdGFbc2VsZWN0ZWRPYmplY3RJZF07XG4gICAgbGFzdEV2ZW50IDw9IDAgPyBsYXN0RXZlbnQgPSBudWxsIDogbGFzdEV2ZW50LS07XG4gIH1cblxuICBMb29wRmFjdG9yeS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGFUb1NhdmUgPSBbXTtcbiAgICBmb3IgKHZhciBpIGluIGxvb3BNdXNpY0RhdGEpIHtcbiAgICAgIGRhdGFUb1NhdmUucHVzaChsb29wTXVzaWNEYXRhW2ldKTtcbiAgICB9XG4gICAgJGh0dHAucG9zdCgnL2FwaS9sb29wcycsIGRhdGFUb1NhdmUpO1xuICB9XG5cbiAgcmV0dXJuIExvb3BGYWN0b3J5O1xuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9vcCcsIHtcbiAgICAgICAgdXJsOiAnL2xvb3AnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9vcENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvb3AvbG9vcC5odG1sJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdsb29wcycsIHtcbiAgICAgIHVybDogJy9sb29wcycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvb3AvbG9vcHMuaHRtbCdcbiAgICB9KVxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lbWJlcnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0Z1bGxzdGFja1BpY3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFdlpBZy1WQUFBazkzMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NDRjNUNVFXOEFFMmxHSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBUU93OWxXRUFBWTlGbC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I1UFRkdm5DY0FFQWw0eC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0J3cEl3cjFJVUFBdk8yXy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NKNHZMZnVVd0FBZGE0TC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJN3d6akVWRUFBT1BwUy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJZEh2VDJVc0FBbm5IVi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NHQ2lQX1lXWUFBbzc1Vi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJUzRKUElXSUFJMzdxdS5qcGc6bGFyZ2UnXG4gICAgXTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1JhbmRvbUdyZWV0aW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICB2YXIgZ3JlZXRpbmdzID0gW1xuICAgICAgICAnSGVsbG8sIHdvcmxkIScsXG4gICAgICAgICdBdCBsb25nIGxhc3QsIEkgbGl2ZSEnLFxuICAgICAgICAnSGVsbG8sIHNpbXBsZSBodW1hbi4nLFxuICAgICAgICAnV2hhdCBhIGJlYXV0aWZ1bCBkYXkhJyxcbiAgICAgICAgJ0lcXCdtIGxpa2UgYW55IG90aGVyIHByb2plY3QsIGV4Y2VwdCB0aGF0IEkgYW0geW91cnMuIDopJyxcbiAgICAgICAgJ1RoaXMgZW1wdHkgc3RyaW5nIGlzIGZvciBMaW5kc2F5IExldmluZS4nLFxuICAgICAgICAn44GT44KT44Gr44Gh44Gv44CB44Om44O844K244O85qeY44CCJyxcbiAgICAgICAgJ1dlbGNvbWUuIFRvLiBXRUJTSVRFLicsXG4gICAgICAgICc6RCcsXG4gICAgICAgICdZZXMsIEkgdGhpbmsgd2VcXCd2ZSBtZXQgYmVmb3JlLicsXG4gICAgICAgICdHaW1tZSAzIG1pbnMuLi4gSSBqdXN0IGdyYWJiZWQgdGhpcyByZWFsbHkgZG9wZSBmcml0dGF0YScsXG4gICAgICAgICdJZiBDb29wZXIgY291bGQgb2ZmZXIgb25seSBvbmUgcGllY2Ugb2YgYWR2aWNlLCBpdCB3b3VsZCBiZSB0byBuZXZTUVVJUlJFTCEnLFxuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2Fib3V0JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdEb2N1bWVudGF0aW9uJywgc3RhdGU6ICdkb2NzJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdNZW1iZXJzIE9ubHknLCBzdGF0ZTogJ21lbWJlcnNPbmx5JywgYXV0aDogdHJ1ZSB9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ3JhbmRvR3JlZXRpbmcnLCBmdW5jdGlvbiAoUmFuZG9tR3JlZXRpbmdzKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLmdyZWV0aW5nID0gUmFuZG9tR3JlZXRpbmdzLmdldFJhbmRvbUdyZWV0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
