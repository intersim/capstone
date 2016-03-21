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
app.controller('LoopController', function ($scope, LoopFactory, loop) {

    LoopFactory.initialize();

    if (loop) LoopFactory.drawLoop(loop);

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

    function getYvals(note) {
        var edges = noteYMap.filter(function (obj) {
            return obj.note === note.pitch;
        })[0];
        return { top: edges.top, bottom: edges.bottom };
    }

    function getXvals(note) {
        var edges = noteXMap.filter(function (obj) {
            return obj.time === note.startTime;
        })[0];
        return { left: edges.left, right: edges.right };
    }

    var noteYMap = [{ note: "c5", top: 0, bottom: 39 }, { note: "b4", top: 40, bottom: 79 }, { note: "a4", top: 80, bottom: 119 }, { note: "g4", top: 120, bottom: 159 }, { note: "f4", top: 160, bottom: 199 }, { note: "e4", top: 200, bottom: 239 }, { note: "d4", top: 240, bottom: 279 }, { note: "c4", top: 280, bottom: 319 }];

    var noteXMap = [{ time: "0:0:0", left: 0, right: 39 }, { time: "0:0:2", left: 40, right: 79 }, { time: "0:1:0", left: 80, right: 119 }, { time: "0:1:2", left: 120, right: 159 }, { time: "0:2:0", left: 160, right: 199 }, { time: "0:2:2", left: 200, right: 239 }, { time: "0:3:0", left: 240, right: 279 }, { time: "0:3:2", left: 280, right: 320 }];

    LoopFactory.drawLoop = function (loop) {
        loop.notes.forEach(function (note) {
            var x = getXvals(note);
            var y = getYvals(note);
            LoopFactory.addNote(null, x.left, x.right, y.top);
        });
    };

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

    LoopFactory.addNote = function (options, left, right, top) {
        if (options && options.target) {
            synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
            return;
        }

        var offsetX = left || options.e.offsetX;
        var offsetY = top || options.e.offsetY;
        var newObjectId = lastObjId++;

        canvas.add(new fabric.Rect({
            id: newObjectId,
            left: Math.floor(offsetX / 40) * 40,
            right: Math.floor(offsetX / 40) * 40,
            top: Math.floor(offsetY / 40) * 40,
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
        synth.triggerAttackRelease(getPitchStr(offsetY), "8n");
        // console.log('options e from 124', options.e)
        var eventId = scheduleTone(offsetX, offsetY, newObjectId);
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
        console.log(dataToSave);
        $http.post('/api/loops', { notes: dataToSave });
    };

    return LoopFactory;
});
app.config(function ($stateProvider) {

    $stateProvider.state('loop', {
        url: '/loop/:loopId',
        controller: 'LoopController',
        templateUrl: 'js/loop/loop.html',
        resolve: {
            loop: function loop($http, $stateParams) {
                return $http.get('/api/loops/' + $stateParams.loopId).then(function (res) {
                    console.log(res);
                    return res.data;
                });
            }
        }
    }).state('loops', {
        url: '/loops',
        templateUrl: 'js/loop/loops.html',
        resolve: {
            loops: function loops($http) {
                return $http.get('/api/loops').then(function (res) {
                    return res.data;
                });
            }
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvb3AvbG9vcC5jb250cm9sbGVyLmpzIiwibG9vcC9sb29wLmZhY3RvcnkuanMiLCJsb29wL2xvb3Auc3RhdGUuanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQ2xEQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ0xBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBOztBQUVBLGVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLElBQUEsRUFBQSxXQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGdCQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsV0FBQSxDQUFBLFVBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDdEJBLFlBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxnQkFBQSxFQUFBLENBQUEsRUFBQTtLQUNBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsT0FBQSxDQUFBOzs7QUFHQSxRQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxhQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGFBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLENBQUEsSUFBQSxJQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsRUFBQSxJQUFBLElBQUEsR0FBQSxFQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxFQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsSUFBQSxHQUFBLEVBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEVBQUEsSUFBQSxJQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsRUFBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxPQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxPQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxZQUFBLEtBQUEsR0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBO0FBQ0EsaUJBQUEsQ0FBQSxvQkFBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtTQUNBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxRQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxLQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsQ0FBQSxJQUFBLEtBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxRQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxLQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsQ0FBQSxJQUFBLEtBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0E7O0FBRUEsUUFBQSxRQUFBLEdBQUEsQ0FDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsRUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLEVBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsQ0FDQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsRUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBOzs7QUFHQSxjQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLEVBQUEsS0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFHQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0E7Ozs7QUFJQSxjQUFBLENBQUEsRUFBQSxDQUFBLFlBQUEsRUFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsRUFBQSxXQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLGVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLFlBQUEsR0FBQSxhQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxlQUFBLGFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTs7O0FBR0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsU0FBQSxHQUFBLElBQUEsR0FBQSxTQUFBLEVBQUEsQ0FBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLFdBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOztLQUVBLENBQUE7O0FBRUEsZUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsT0FBQSxJQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLG9CQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQTtTQUNBOztBQUVBLFlBQUEsT0FBQSxHQUFBLElBQUEsSUFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsT0FBQSxHQUFBLEdBQUEsSUFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsV0FBQSxHQUFBLFNBQUEsRUFBQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxFQUFBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQTtBQUNBLG1CQUFBLEVBQUEsTUFBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLDRCQUFBLEVBQUEsSUFBQTtBQUNBLHlCQUFBLEVBQUEsQ0FBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtBQUNBLDJCQUFBLEVBQUEsSUFBQTtBQUNBLDRCQUFBLEVBQUEsS0FBQTtTQUNBLENBQUEsQ0FDQSxDQUFBOztBQUVBLFlBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBOzs7O0FBSUEsYUFBQSxDQUFBLG9CQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLFlBQUEsT0FBQSxHQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsaUJBQUEsS0FBQSxJQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxTQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxnQkFBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxlQUFBLGFBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxTQUFBLEdBQUEsSUFBQSxHQUFBLFNBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxlQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxJQUFBLGFBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMxTkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsZUFBQTtBQUNBLGtCQUFBLEVBQUEsZ0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSx1QkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsR0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsMkJBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSwyQkFBQSxHQUFBLENBQUEsSUFBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBO1NBQ0E7S0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxvQkFBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsZUFBQSxLQUFBLEVBQUE7QUFDQSx1QkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLDJCQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzdCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxlQUFBO0FBQ0EsZ0JBQUEsRUFBQSxtRUFBQTtBQUNBLGtCQUFBLEVBQUEsb0JBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7OztBQUdBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsUUFBQSxHQUFBLFNBQUEsUUFBQSxHQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQy9CQSxHQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxDQUNBLHVEQUFBLEVBQ0EscUhBQUEsRUFDQSxpREFBQSxFQUNBLGlEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsQ0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQzdCQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLGVBQUEsRUFDQSx1QkFBQSxFQUNBLHNCQUFBLEVBQ0EsdUJBQUEsRUFDQSx5REFBQSxFQUNBLDBDQUFBLEVBQ0EsY0FBQSxFQUNBLHVCQUFBLEVBQ0EsSUFBQSxFQUNBLGlDQUFBLEVBQ0EsMERBQUEsRUFDQSw2RUFBQSxDQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsU0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxrQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQzVCQSxHQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEseURBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDTEEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSx5Q0FBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTs7QUFFQSxpQkFBQSxDQUFBLEtBQUEsR0FBQSxDQUNBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxlQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGNBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsdUJBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsMkJBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLDBCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsZ0JBQUEsT0FBQSxHQUFBLFNBQUEsT0FBQSxHQUFBO0FBQ0EsMkJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSx5QkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxVQUFBLEdBQUEsU0FBQSxVQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLG1CQUFBLEVBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7U0FFQTs7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQy9DQSxHQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLGVBQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsUUFBQSxHQUFBLGVBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG9jcycsIHtcbiAgICAgICAgdXJsOiAnL2RvY3MnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2RvY3MvZG9jcy5odG1sJ1xuICAgIH0pO1xufSk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnU29ja2V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXdpbmRvdy5pbykgdGhyb3cgbmV3IEVycm9yKCdzb2NrZXQuaW8gbm90IGZvdW5kIScpO1xuICAgICAgICByZXR1cm4gd2luZG93LmlvKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBTZXNzaW9uLCAkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUywgJHEpIHtcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uIChmcm9tU2VydmVyKSB7XG5cbiAgICAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXG4gICAgICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxuICAgICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHsgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJyB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9nb3V0U3VjY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAoc2Vzc2lvbklkLCB1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSkoKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29udHJvbGxlcignTG9vcENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBMb29wRmFjdG9yeSwgbG9vcCkge1xuXG4gIExvb3BGYWN0b3J5LmluaXRpYWxpemUoKTtcblxuICBpZiAobG9vcCkgTG9vcEZhY3RvcnkuZHJhd0xvb3AobG9vcCk7XG5cbiAgJHNjb3BlLnBsYXlpbmcgPSBmYWxzZTtcblxuICAkc2NvcGUudG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5wbGF5aW5nKSB7XG4gICAgICBUb25lLlRyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAkc2NvcGUucGxheWluZyA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBUb25lLlRyYW5zcG9ydC5zdGFydCgpO1xuICAgICAgJHNjb3BlLnBsYXlpbmcgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5kZWxldGVTZWxlY3RlZCA9IExvb3BGYWN0b3J5LmRlbGV0ZU5vdGU7XG4gIFxuICAkc2NvcGUuc2F2ZUxvb3AgPSBMb29wRmFjdG9yeS5zYXZlO1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5cbmFwcC5mYWN0b3J5KCdMb29wRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcbiAgdmFyIExvb3BGYWN0b3J5ID0ge307XG5cbiAgdmFyIGNhbnZhcztcbiAgdmFyIHN5bnRoID0gbmV3IFRvbmUuUG9seVN5bnRoKDE2LCBUb25lLlNpbXBsZVN5bnRoLCB7XG4gICAgICAgICAgICBcIm9zY2lsbGF0b3JcIiA6IHtcbiAgICAgICAgICAgICAgICBcInBhcnRpYWxzXCIgOiBbMCwgMiwgMywgNF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ2b2x1bWVcIiA6IC0xMlxuICAgICAgICB9KS50b01hc3RlcigpO1xuICBcbiAgLy8gaW5pdGlhbGl6ZSBsb29waW5nXG4gIFRvbmUuVHJhbnNwb3J0Lmxvb3AgPSB0cnVlO1xuICBUb25lLlRyYW5zcG9ydC5sb29wU3RhcnQgPSBcIjA6MDowXCI7XG4gIFRvbmUuVHJhbnNwb3J0Lmxvb3BFbmQgPSBcIjA6NDowXCI7XG4gIFxuICAvLyBpbnRpYWxpemUgVHJhbnNwb3J0IGV2ZW50IHRpbWVsaW5lIHRyYWNraW5nXG4gIHZhciBsYXN0RXZlbnQgPSBudWxsO1xuICB2YXIgbGFzdE9iaklkID0gMTY7XG5cbiAgdmFyIGxvb3BNdXNpY0RhdGEgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRQaXRjaFN0ciAoeVZhbCkge1xuICAgIGlmICh5VmFsID49IDAgJiYgeVZhbCA8IDQwKSByZXR1cm4gXCJjNVwiO1xuICAgIGlmICh5VmFsID49IDQwICYmIHlWYWwgPCA4MCkgcmV0dXJuIFwiYjRcIjtcbiAgICBpZiAoeVZhbCA+PSA4MCAmJiB5VmFsIDwgMTIwKSByZXR1cm4gXCJhNFwiO1xuICAgIGlmICh5VmFsID49IDEyMCAmJiB5VmFsIDwgMTYwKSByZXR1cm4gXCJnNFwiO1xuICAgIGlmICh5VmFsID49IDE2MCAmJiB5VmFsIDwgMjAwKSByZXR1cm4gXCJmNFwiO1xuICAgIGlmICh5VmFsID49IDIwMCAmJiB5VmFsIDwgMjQwKSByZXR1cm4gXCJlNFwiO1xuICAgIGlmICh5VmFsID49IDI0MCAmJiB5VmFsIDwgMjgwKSByZXR1cm4gXCJkNFwiO1xuICAgIGlmICh5VmFsID49IDI4MCAmJiB5VmFsIDwgMzIwKSByZXR1cm4gXCJjNFwiO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QmVhdFN0ciAoeFZhbCkge1xuICAgIGlmICh4VmFsID49IDAgJiYgeFZhbCA8IDQwKSByZXR1cm4gXCIwOjA6MFwiO1xuICAgIGlmICh4VmFsID49IDQwICYmIHhWYWwgPCA4MCkgcmV0dXJuIFwiMDowOjJcIjtcbiAgICBpZiAoeFZhbCA+PSA4MCAmJiB4VmFsIDwgMTIwKSByZXR1cm4gXCIwOjE6MFwiO1xuICAgIGlmICh4VmFsID49IDEyMCAmJiB4VmFsIDwgMTYwKSByZXR1cm4gXCIwOjE6MlwiO1xuICAgIGlmICh4VmFsID49IDE2MCAmJiB4VmFsIDwgMjAwKSByZXR1cm4gXCIwOjI6MFwiO1xuICAgIGlmICh4VmFsID49IDIwMCAmJiB4VmFsIDwgMjQwKSByZXR1cm4gXCIwOjI6MlwiO1xuICAgIGlmICh4VmFsID49IDI0MCAmJiB4VmFsIDwgMjgwKSByZXR1cm4gXCIwOjM6MFwiO1xuICAgIGlmICh4VmFsID49IDI4MCAmJiB4VmFsIDwgMzIwKSByZXR1cm4gXCIwOjM6MlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGVUb25lIChvYmpYLCBvYmpZLCBuZXdPYmplY3RJZCkge1xuICAgIHZhciBwaXRjaCA9IGdldFBpdGNoU3RyKG9ialkpO1xuICAgIHZhciBkdXJhdGlvbiA9IFwiOG5cIjtcbiAgICB2YXIgc3RhcnRUaW1lID0gZ2V0QmVhdFN0cihvYmpYKTtcbiAgICB2YXIgZXZlbnRJZCA9IFRvbmUuVHJhbnNwb3J0LnNjaGVkdWxlKGZ1bmN0aW9uKCl7XG4gICAgICBzeW50aC50cmlnZ2VyQXR0YWNrUmVsZWFzZShwaXRjaCwgZHVyYXRpb24pO1xuICAgIH0sIHN0YXJ0VGltZSk7XG4gICAgbG9vcE11c2ljRGF0YVtuZXdPYmplY3RJZF0gPSB7cGl0Y2g6IHBpdGNoLCBkdXJhdGlvbjogZHVyYXRpb24sIHN0YXJ0VGltZTogc3RhcnRUaW1lfTtcbiAgICByZXR1cm4gZXZlbnRJZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFl2YWxzKG5vdGUpIHtcbiAgICB2YXIgZWRnZXMgPSBub3RlWU1hcC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqLm5vdGUgPT09IG5vdGUucGl0Y2g7XG4gICAgfSlbMF07XG4gICAgcmV0dXJuIHt0b3A6IGVkZ2VzLnRvcCwgYm90dG9tOiBlZGdlcy5ib3R0b219O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0WHZhbHMobm90ZSkge1xuICAgIHZhciBlZGdlcyA9IG5vdGVYTWFwLmZpbHRlcihmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmoudGltZSA9PT0gbm90ZS5zdGFydFRpbWU7XG4gICAgfSlbMF07XG4gICAgcmV0dXJuIHtsZWZ0OiBlZGdlcy5sZWZ0LCByaWdodDogZWRnZXMucmlnaHR9O1xuICB9XG5cbiAgdmFyIG5vdGVZTWFwID0gW1xuICAgIHtub3RlOiBcImM1XCIsIHRvcDogMCwgYm90dG9tOiAzOX0sXG4gICAge25vdGU6IFwiYjRcIiwgdG9wOiA0MCwgYm90dG9tOiA3OX0sXG4gICAge25vdGU6IFwiYTRcIiwgdG9wOiA4MCwgYm90dG9tOiAxMTl9LFxuICAgIHtub3RlOiBcImc0XCIsIHRvcDogMTIwLCBib3R0b206IDE1OX0sXG4gICAge25vdGU6IFwiZjRcIiwgdG9wOiAxNjAsIGJvdHRvbTogMTk5fSxcbiAgICB7bm90ZTogXCJlNFwiLCB0b3A6IDIwMCwgYm90dG9tOiAyMzl9LFxuICAgIHtub3RlOiBcImQ0XCIsIHRvcDogMjQwLCBib3R0b206IDI3OX0sXG4gICAge25vdGU6IFwiYzRcIiwgdG9wOiAyODAsIGJvdHRvbTogMzE5fVxuICBdXG5cbiAgdmFyIG5vdGVYTWFwID0gW1xuICAgIHt0aW1lOiBcIjA6MDowXCIsIGxlZnQ6IDAsIHJpZ2h0OiAzOX0sXG4gICAge3RpbWU6IFwiMDowOjJcIiwgbGVmdDogNDAsIHJpZ2h0OiA3OX0sXG4gICAge3RpbWU6IFwiMDoxOjBcIiwgbGVmdDogODAsIHJpZ2h0OiAxMTl9LFxuICAgIHt0aW1lOiBcIjA6MToyXCIsIGxlZnQ6IDEyMCwgcmlnaHQ6IDE1OX0sXG4gICAge3RpbWU6IFwiMDoyOjBcIiwgbGVmdDogMTYwLCByaWdodDogMTk5fSxcbiAgICB7dGltZTogXCIwOjI6MlwiLCBsZWZ0OiAyMDAsIHJpZ2h0OiAyMzl9LFxuICAgIHt0aW1lOiBcIjA6MzowXCIsIGxlZnQ6IDI0MCwgcmlnaHQ6IDI3OX0sXG4gICAge3RpbWU6IFwiMDozOjJcIiwgbGVmdDogMjgwLCByaWdodDogMzIwfVxuICBdXG4gIFxuICBMb29wRmFjdG9yeS5kcmF3TG9vcCA9IGZ1bmN0aW9uKGxvb3ApIHtcbiAgICBsb29wLm5vdGVzLmZvckVhY2goZnVuY3Rpb24obm90ZSkge1xuICAgICAgdmFyIHggPSBnZXRYdmFscyhub3RlKTtcbiAgICAgIHZhciB5ID0gZ2V0WXZhbHMobm90ZSk7XG4gICAgICBMb29wRmFjdG9yeS5hZGROb3RlKG51bGwsIHgubGVmdCwgeC5yaWdodCwgeS50b3ApO1xuICAgIH0pXG4gIH1cblxuICBMb29wRmFjdG9yeS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBpbml0aWFsaXplIGNhbnZhcyBmb3IgYSA4ICogOCBncmlkXG4gICAgY2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXMoJ2MnLCB7IFxuICAgICAgICBzZWxlY3Rpb246IGZhbHNlXG4gICAgICB9KTtcbiAgICBjYW52YXMuc2V0SGVpZ2h0KDMyMCk7XG4gICAgY2FudmFzLnNldFdpZHRoKDMyMCk7XG4gICAgY2FudmFzLnJlbmRlckFsbCgpO1xuICAgIHZhciBncmlkID0gNDA7XG5cbiAgICAvLyBkcmF3IGxpbmVzIG9uIGdyaWRcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICgzMjAgLyBncmlkKTsgaSsrKSB7XG4gICAgICBjYW52YXMuYWRkKG5ldyBmYWJyaWMuTGluZShbIGkgKiBncmlkLCAwLCBpICogZ3JpZCwgMzIwXSwgeyBzdHJva2U6ICcjY2NjJywgc2VsZWN0YWJsZTogZmFsc2UgfSkpO1xuICAgICAgY2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWyAwLCBpICogZ3JpZCwgMzIwLCBpICogZ3JpZF0sIHsgc3Ryb2tlOiAnI2NjYycsIHNlbGVjdGFibGU6IGZhbHNlIH0pKVxuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBhIG5ldyByZWN0YW5nbGUgb2JqIG9uIG1vdXNlZG93biBpbiBjYW52YXMgYXJlYVxuICAgIC8vIGNoYW5nZSB0aGlzIHRvIGEgZG91YmxlLWNsaWNrIGV2ZW50IChoYXZlIHRvIGFkZCBhIGxpc3RlbmVyKT9cbiAgICBjYW52YXMub24oJ21vdXNlOmRvd24nLCBMb29wRmFjdG9yeS5hZGROb3RlKVxuXG4gICAgLy8gc25hcCB0byBncmlkIHdoZW4gbW92aW5nIG9iaiAoZG9lc24ndCB3b3JrIHdoZW4gcmVzaXppbmcpOlxuICAgIGNhbnZhcy5vbignb2JqZWN0Om1vZGlmaWVkJywgTG9vcEZhY3Rvcnkuc25hcFRvR3JpZCApXG5cbiAgfVxuXG4gIExvb3BGYWN0b3J5LnNuYXBUb0dyaWQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9wdGlvbnNcIiwgb3B0aW9ucylcbiAgICAgIGNvbnNvbGUubG9nKCdvcHRpb25zIHRhcmdldCcsIG9wdGlvbnMudGFyZ2V0KVxuICAgICAgb3B0aW9ucy50YXJnZXQuc2V0KHtcbiAgICAgICAgbGVmdDogTWF0aC5yb3VuZChvcHRpb25zLnRhcmdldC5sZWZ0IC8gZ3JpZCkgKiBncmlkLFxuICAgICAgICB0b3A6IE1hdGgucm91bmQob3B0aW9ucy50YXJnZXQudG9wIC8gZ3JpZCkgKiBncmlkXG4gICAgICB9KTtcbiAgICAgIHZhciBpZEMgPSBjYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCkuaWRcbiAgICAgIHZhciBub3RlVG9EZWxldGUgPSBsb29wTXVzaWNEYXRhW2lkQ107XG4gICAgICBkZWxldGUgbG9vcE11c2ljRGF0YVtpZENdO1xuICAgICAgXG4gICAgICAvL2RlbGV0ZSBvbGQgZXZlbnRcbiAgICAgIFRvbmUuVHJhbnNwb3J0LmNsZWFyKGlkQyAtIDE2KTtcbiAgICAgIGxhc3RFdmVudCA8PSAwID8gbGFzdEV2ZW50ID0gbnVsbCA6IGxhc3RFdmVudC0tO1xuICAgICAgLy9tYWtlIG5ldyBvbmVcbiAgICAgIHZhciB4VmFsID0gTWF0aC5jZWlsKG9wdGlvbnMudGFyZ2V0Lm9Db29yZHMudGwueClcbiAgICAgIGlmKHhWYWwgPCAwKSB4VmFsID0gMDtcbiAgICAgIHZhciB5VmFsID0gTWF0aC5jZWlsKG9wdGlvbnMudGFyZ2V0Lm9Db29yZHMudGwueSlcbiAgICAgIGlmKHlWYWwgPCAwKSB5VmFsID0gMDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwieDogXCIsIHhWYWwsIFwieTogXCIsIHlWYWwpXG4gICAgICB2YXIgbmV3T2JqZWN0SWQgPSBuZXdFdmVudElkICsgMTY7XG4gICAgICB2YXIgbmV3RXZlbnRJZCA9IHNjaGVkdWxlVG9uZSh4VmFsLCB5VmFsLCBuZXdPYmplY3RJZCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIm5ld0V2ZW50SWQ6IFwiLCBuZXdFdmVudElkKTtcbiAgICAgIG5ld0lkQyA9IGNhbnZhcy5nZXRBY3RpdmVPYmplY3QoKS5zZXQoJ2lkJywgbmV3T2JqZWN0SWQpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJuZXcgb2JqSWQ6IFwiLCBuZXdJZEMpO1xuICB9XG5cbiAgTG9vcEZhY3RvcnkuYWRkTm90ZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGxlZnQsIHJpZ2h0LCB0b3Ape1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICBzeW50aC50cmlnZ2VyQXR0YWNrUmVsZWFzZShnZXRQaXRjaFN0cihvcHRpb25zLmUub2Zmc2V0WSksIFwiOG5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG9mZnNldFggPSBsZWZ0IHx8IG9wdGlvbnMuZS5vZmZzZXRYO1xuICAgIHZhciBvZmZzZXRZID0gdG9wIHx8IG9wdGlvbnMuZS5vZmZzZXRZXG4gICAgdmFyIG5ld09iamVjdElkID0gbGFzdE9iaklkKys7XG5cbiAgICBjYW52YXMuYWRkKG5ldyBmYWJyaWMuUmVjdCh7XG4gICAgICAgIGlkOiBuZXdPYmplY3RJZCxcbiAgICAgICAgbGVmdDogTWF0aC5mbG9vcihvZmZzZXRYIC8gNDApICogNDAsXG4gICAgICAgIHJpZ2h0OiBNYXRoLmZsb29yKG9mZnNldFggLyA0MCkgKiA0MCxcbiAgICAgICAgdG9wOiBNYXRoLmZsb29yKG9mZnNldFkgLyA0MCkgKiA0MCxcbiAgICAgICAgd2lkdGg6IDQwLCBcbiAgICAgICAgaGVpZ2h0OiA0MCwgXG4gICAgICAgIGZpbGw6ICcjZmFhJywgXG4gICAgICAgIG9yaWdpblg6ICdsZWZ0JywgXG4gICAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgICBjZW50ZXJlZFJvdGF0aW9uOiB0cnVlLFxuICAgICAgICBtaW5TY2FsZUxpbWl0OiAwLFxuICAgICAgICBsb2NrU2NhbGluZ1k6IHRydWUsXG4gICAgICAgIGxvY2tTY2FsaW5nRmxpcDogdHJ1ZSxcbiAgICAgICAgaGFzUm90YXRpbmdQb2ludDogZmFsc2VcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHZhciBuZXdJdGVtID0gY2FudmFzLml0ZW0obmV3T2JqZWN0SWQpO1xuICAgIGNhbnZhcy5zZXRBY3RpdmVPYmplY3QobmV3SXRlbSk7XG4gICAgLy8gY29uc29sZS5sb2coJ2lkIG9mIG5ldyBvYmo6ICcsIGNhbnZhcy5nZXRBY3RpdmVPYmplY3QoKS5nZXQoJ2lkJykpO1xuXG4gICAgLy8gc291bmQgdG9uZSB3aGVuIGNsaWNraW5nLCBhbmQgc2NoZWR1bGVcbiAgICBzeW50aC50cmlnZ2VyQXR0YWNrUmVsZWFzZShnZXRQaXRjaFN0cihvZmZzZXRZKSwgXCI4blwiKTtcbiAgICAvLyBjb25zb2xlLmxvZygnb3B0aW9ucyBlIGZyb20gMTI0Jywgb3B0aW9ucy5lKVxuICAgIHZhciBldmVudElkID0gc2NoZWR1bGVUb25lKG9mZnNldFgsIG9mZnNldFksIG5ld09iamVjdElkKTtcbiAgICAvLyBjb25zb2xlLmxvZygnaWQgb2YgbmV3IHRyYW5zcG9ydCBldnQ6ICcsIGV2ZW50SWQpO1xuXG4gICAgLy9pbmNyZW1lbnQgbGFzdCBldmVudCBmb3IgY2xlYXIgYnV0dG9uXG4gICAgbGFzdEV2ZW50ID09PSBudWxsID8gbGFzdEV2ZW50ID0gMCA6IGxhc3RFdmVudCsrO1xuICB9XG5cbiAgTG9vcEZhY3RvcnkuZGVsZXRlTm90ZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHNlbGVjdGVkT2JqZWN0SWQgPSBjYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCkuaWQ7XG4gICAgY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpLnJlbW92ZSgpO1xuICAgIGxhc3RPYmpJZC0tO1xuICAgIC8vIGFsc28gZGVsZXRlIHRvbmUgZXZlbnQ6XG4gICAgVG9uZS5UcmFuc3BvcnQuY2xlYXIoc2VsZWN0ZWRPYmplY3RJZC0xNik7XG4gICAgLy8gZGVsZXRlIGZyb20gSlNPTiBkYXRhIHN0b3JlXG4gICAgZGVsZXRlIGxvb3BNdXNpY0RhdGFbc2VsZWN0ZWRPYmplY3RJZF07XG4gICAgbGFzdEV2ZW50IDw9IDAgPyBsYXN0RXZlbnQgPSBudWxsIDogbGFzdEV2ZW50LS07XG4gIH1cblxuICBMb29wRmFjdG9yeS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGFUb1NhdmUgPSBbXTtcbiAgICBmb3IgKHZhciBpIGluIGxvb3BNdXNpY0RhdGEpIHtcbiAgICAgIGRhdGFUb1NhdmUucHVzaChsb29wTXVzaWNEYXRhW2ldKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coZGF0YVRvU2F2ZSk7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9sb29wcycsIHsgbm90ZXM6IGRhdGFUb1NhdmUgfSk7XG4gIH1cblxuICByZXR1cm4gTG9vcEZhY3Rvcnk7XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb29wJywge1xuICAgICAgICB1cmw6ICcvbG9vcC86bG9vcElkJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvb3BDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb29wL2xvb3AuaHRtbCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBsb29wOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xvb3BzLycgKyAkc3RhdGVQYXJhbXMubG9vcElkKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2xvb3BzJywge1xuICAgICAgdXJsOiAnL2xvb3BzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9vcC9sb29wcy5odG1sJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgbG9vcHM6IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9sb29wcycpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWVtYmVyc09ubHknLCB7XG4gICAgICAgIHVybDogJy9tZW1iZXJzLWFyZWEnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxpbWcgbmctcmVwZWF0PVwiaXRlbSBpbiBzdGFzaFwiIHdpZHRoPVwiMzAwXCIgbmctc3JjPVwie3sgaXRlbSB9fVwiIC8+JyxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgU2VjcmV0U3Rhc2gpIHtcbiAgICAgICAgICAgIFNlY3JldFN0YXNoLmdldFN0YXNoKCkudGhlbihmdW5jdGlvbiAoc3Rhc2gpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3Rhc2ggPSBzdGFzaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1NlY3JldFN0YXNoJywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICB2YXIgZ2V0U3Rhc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9zZWNyZXQtc3Rhc2gnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTdGFzaDogZ2V0U3Rhc2hcbiAgICB9O1xuXG59KTsiLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lkSHZUMlVzQUFubkhWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLicsXG4gICAgICAgICfjgZPjgpPjgavjgaHjga/jgIHjg6bjg7zjgrbjg7zmp5jjgIInLFxuICAgICAgICAnV2VsY29tZS4gVG8uIFdFQlNJVEUuJyxcbiAgICAgICAgJzpEJyxcbiAgICAgICAgJ1llcywgSSB0aGluayB3ZVxcJ3ZlIG1ldCBiZWZvcmUuJyxcbiAgICAgICAgJ0dpbW1lIDMgbWlucy4uLiBJIGp1c3QgZ3JhYmJlZCB0aGlzIHJlYWxseSBkb3BlIGZyaXR0YXRhJyxcbiAgICAgICAgJ0lmIENvb3BlciBjb3VsZCBvZmZlciBvbmx5IG9uZSBwaWVjZSBvZiBhZHZpY2UsIGl0IHdvdWxkIGJlIHRvIG5ldlNRVUlSUkVMIScsXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdyZWV0aW5nczogZ3JlZXRpbmdzLFxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBYm91dCcsIHN0YXRlOiAnYWJvdXQnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0RvY3VtZW50YXRpb24nLCBzdGF0ZTogJ2RvY3MnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ01lbWJlcnMgT25seScsIHN0YXRlOiAnbWVtYmVyc09ubHknLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZSgncmFuZG9HcmVldGluZycsIGZ1bmN0aW9uIChSYW5kb21HcmVldGluZ3MpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcmFuZG8tZ3JlZXRpbmcvcmFuZG8tZ3JlZXRpbmcuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUuZ3JlZXRpbmcgPSBSYW5kb21HcmVldGluZ3MuZ2V0UmFuZG9tR3JlZXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
