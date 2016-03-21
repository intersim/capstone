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
        url: '/loop',
        controller: 'LoopController',
        templateUrl: 'js/loop/loop.html',
        resolve: {
            loop: function loop($http) {
                return $http.get('/api/loops/56f06287921942a929699b10').then(function (res) {
                    console.log(res);
                    return res.data;
                });
            }
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvb3AvbG9vcC5jb250cm9sbGVyLmpzIiwibG9vcC9sb29wLmZhY3RvcnkuanMiLCJsb29wL2xvb3Auc3RhdGUuanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQ2xEQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ0xBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBOzs7O0FBSUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7O0FDcElBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBOztBQUVBLGVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLElBQUEsRUFBQSxXQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGdCQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsV0FBQSxDQUFBLFVBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDdEJBLFlBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxnQkFBQSxFQUFBLENBQUEsRUFBQTtLQUNBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsT0FBQSxDQUFBOzs7QUFHQSxRQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxhQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGFBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLENBQUEsSUFBQSxJQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsRUFBQSxJQUFBLElBQUEsR0FBQSxFQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxFQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxJQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsSUFBQSxHQUFBLEVBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEVBQUEsSUFBQSxJQUFBLEdBQUEsRUFBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsRUFBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxPQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsR0FBQSxHQUFBLEVBQUEsT0FBQSxPQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsRUFBQSxPQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxFQUFBLE9BQUEsT0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxZQUFBLEtBQUEsR0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLFNBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBO0FBQ0EsaUJBQUEsQ0FBQSxvQkFBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtTQUNBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsT0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxRQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxLQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsQ0FBQSxJQUFBLEtBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxRQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxLQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsQ0FBQSxJQUFBLEtBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0E7O0FBRUEsUUFBQSxRQUFBLEdBQUEsQ0FDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsRUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLEVBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsQ0FDQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsRUFBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxFQUNBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsRUFDQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBLEVBQ0EsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBOzs7QUFHQSxjQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLEVBQUEsS0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFHQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0E7Ozs7QUFJQSxjQUFBLENBQUEsRUFBQSxDQUFBLFlBQUEsRUFBQSxXQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsRUFBQSxXQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLGVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLFlBQUEsR0FBQSxhQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxlQUFBLGFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTs7O0FBR0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsU0FBQSxHQUFBLElBQUEsR0FBQSxTQUFBLEVBQUEsQ0FBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLFdBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOztLQUVBLENBQUE7O0FBRUEsZUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsT0FBQSxJQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLG9CQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQTtTQUNBOztBQUVBLFlBQUEsT0FBQSxHQUFBLElBQUEsSUFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsT0FBQSxHQUFBLEdBQUEsSUFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsV0FBQSxHQUFBLFNBQUEsRUFBQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxFQUFBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQTtBQUNBLG1CQUFBLEVBQUEsTUFBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLDRCQUFBLEVBQUEsSUFBQTtBQUNBLHlCQUFBLEVBQUEsQ0FBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtBQUNBLDJCQUFBLEVBQUEsSUFBQTtBQUNBLDRCQUFBLEVBQUEsS0FBQTtTQUNBLENBQUEsQ0FDQSxDQUFBOztBQUVBLFlBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBOzs7O0FBSUEsYUFBQSxDQUFBLG9CQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLFlBQUEsT0FBQSxHQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsaUJBQUEsS0FBQSxJQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxTQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxnQkFBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxlQUFBLGFBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxTQUFBLEdBQUEsSUFBQSxHQUFBLFNBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxlQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxJQUFBLGFBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMxTkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLGtCQUFBLEVBQUEsZ0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLHVCQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEscUNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLDJCQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsMkJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEsb0JBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7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QSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1NBRUE7O0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUMvQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxlQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEseURBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAvLyBSZWdpc3RlciBvdXIgKmFib3V0KiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWJvdXQnLCB7XG4gICAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBYm91dENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Fib3V0L2Fib3V0Lmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWJvdXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRnVsbHN0YWNrUGljcykge1xuXG4gICAgLy8gSW1hZ2VzIG9mIGJlYXV0aWZ1bCBGdWxsc3RhY2sgcGVvcGxlLlxuICAgICRzY29wZS5pbWFnZXMgPSBfLnNodWZmbGUoRnVsbHN0YWNrUGljcyk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2RvY3MnLCB7XG4gICAgICAgIHVybDogJy9kb2NzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb2NzL2RvY3MuaHRtbCdcbiAgICB9KTtcbn0pO1xuIiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbiAoZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCdcbiAgICB9KTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5zZW5kTG9naW4gPSBmdW5jdGlvbiAobG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ0xvb3BDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgTG9vcEZhY3RvcnksIGxvb3ApIHtcblxuICBMb29wRmFjdG9yeS5pbml0aWFsaXplKCk7XG5cbiAgaWYgKGxvb3ApIExvb3BGYWN0b3J5LmRyYXdMb29wKGxvb3ApO1xuXG4gICRzY29wZS5wbGF5aW5nID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucGxheWluZykge1xuICAgICAgVG9uZS5UcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgJHNjb3BlLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgVG9uZS5UcmFuc3BvcnQuc3RhcnQoKTtcbiAgICAgICRzY29wZS5wbGF5aW5nID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlU2VsZWN0ZWQgPSBMb29wRmFjdG9yeS5kZWxldGVOb3RlO1xuICBcbiAgJHNjb3BlLnNhdmVMb29wID0gTG9vcEZhY3Rvcnkuc2F2ZTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuZmFjdG9yeSgnTG9vcEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG4gIHZhciBMb29wRmFjdG9yeSA9IHt9O1xuXG4gIHZhciBjYW52YXM7XG4gIHZhciBzeW50aCA9IG5ldyBUb25lLlBvbHlTeW50aCgxNiwgVG9uZS5TaW1wbGVTeW50aCwge1xuICAgICAgICAgICAgXCJvc2NpbGxhdG9yXCIgOiB7XG4gICAgICAgICAgICAgICAgXCJwYXJ0aWFsc1wiIDogWzAsIDIsIDMsIDRdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidm9sdW1lXCIgOiAtMTJcbiAgICAgICAgfSkudG9NYXN0ZXIoKTtcbiAgXG4gIC8vIGluaXRpYWxpemUgbG9vcGluZ1xuICBUb25lLlRyYW5zcG9ydC5sb29wID0gdHJ1ZTtcbiAgVG9uZS5UcmFuc3BvcnQubG9vcFN0YXJ0ID0gXCIwOjA6MFwiO1xuICBUb25lLlRyYW5zcG9ydC5sb29wRW5kID0gXCIwOjQ6MFwiO1xuICBcbiAgLy8gaW50aWFsaXplIFRyYW5zcG9ydCBldmVudCB0aW1lbGluZSB0cmFja2luZ1xuICB2YXIgbGFzdEV2ZW50ID0gbnVsbDtcbiAgdmFyIGxhc3RPYmpJZCA9IDE2O1xuXG4gIHZhciBsb29wTXVzaWNEYXRhID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0UGl0Y2hTdHIgKHlWYWwpIHtcbiAgICBpZiAoeVZhbCA+PSAwICYmIHlWYWwgPCA0MCkgcmV0dXJuIFwiYzVcIjtcbiAgICBpZiAoeVZhbCA+PSA0MCAmJiB5VmFsIDwgODApIHJldHVybiBcImI0XCI7XG4gICAgaWYgKHlWYWwgPj0gODAgJiYgeVZhbCA8IDEyMCkgcmV0dXJuIFwiYTRcIjtcbiAgICBpZiAoeVZhbCA+PSAxMjAgJiYgeVZhbCA8IDE2MCkgcmV0dXJuIFwiZzRcIjtcbiAgICBpZiAoeVZhbCA+PSAxNjAgJiYgeVZhbCA8IDIwMCkgcmV0dXJuIFwiZjRcIjtcbiAgICBpZiAoeVZhbCA+PSAyMDAgJiYgeVZhbCA8IDI0MCkgcmV0dXJuIFwiZTRcIjtcbiAgICBpZiAoeVZhbCA+PSAyNDAgJiYgeVZhbCA8IDI4MCkgcmV0dXJuIFwiZDRcIjtcbiAgICBpZiAoeVZhbCA+PSAyODAgJiYgeVZhbCA8IDMyMCkgcmV0dXJuIFwiYzRcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEJlYXRTdHIgKHhWYWwpIHtcbiAgICBpZiAoeFZhbCA+PSAwICYmIHhWYWwgPCA0MCkgcmV0dXJuIFwiMDowOjBcIjtcbiAgICBpZiAoeFZhbCA+PSA0MCAmJiB4VmFsIDwgODApIHJldHVybiBcIjA6MDoyXCI7XG4gICAgaWYgKHhWYWwgPj0gODAgJiYgeFZhbCA8IDEyMCkgcmV0dXJuIFwiMDoxOjBcIjtcbiAgICBpZiAoeFZhbCA+PSAxMjAgJiYgeFZhbCA8IDE2MCkgcmV0dXJuIFwiMDoxOjJcIjtcbiAgICBpZiAoeFZhbCA+PSAxNjAgJiYgeFZhbCA8IDIwMCkgcmV0dXJuIFwiMDoyOjBcIjtcbiAgICBpZiAoeFZhbCA+PSAyMDAgJiYgeFZhbCA8IDI0MCkgcmV0dXJuIFwiMDoyOjJcIjtcbiAgICBpZiAoeFZhbCA+PSAyNDAgJiYgeFZhbCA8IDI4MCkgcmV0dXJuIFwiMDozOjBcIjtcbiAgICBpZiAoeFZhbCA+PSAyODAgJiYgeFZhbCA8IDMyMCkgcmV0dXJuIFwiMDozOjJcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlVG9uZSAob2JqWCwgb2JqWSwgbmV3T2JqZWN0SWQpIHtcbiAgICB2YXIgcGl0Y2ggPSBnZXRQaXRjaFN0cihvYmpZKTtcbiAgICB2YXIgZHVyYXRpb24gPSBcIjhuXCI7XG4gICAgdmFyIHN0YXJ0VGltZSA9IGdldEJlYXRTdHIob2JqWCk7XG4gICAgdmFyIGV2ZW50SWQgPSBUb25lLlRyYW5zcG9ydC5zY2hlZHVsZShmdW5jdGlvbigpe1xuICAgICAgc3ludGgudHJpZ2dlckF0dGFja1JlbGVhc2UocGl0Y2gsIGR1cmF0aW9uKTtcbiAgICB9LCBzdGFydFRpbWUpO1xuICAgIGxvb3BNdXNpY0RhdGFbbmV3T2JqZWN0SWRdID0ge3BpdGNoOiBwaXRjaCwgZHVyYXRpb246IGR1cmF0aW9uLCBzdGFydFRpbWU6IHN0YXJ0VGltZX07XG4gICAgcmV0dXJuIGV2ZW50SWQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRZdmFscyhub3RlKSB7XG4gICAgdmFyIGVkZ2VzID0gbm90ZVlNYXAuZmlsdGVyKGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iai5ub3RlID09PSBub3RlLnBpdGNoO1xuICAgIH0pWzBdO1xuICAgIHJldHVybiB7dG9wOiBlZGdlcy50b3AsIGJvdHRvbTogZWRnZXMuYm90dG9tfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFh2YWxzKG5vdGUpIHtcbiAgICB2YXIgZWRnZXMgPSBub3RlWE1hcC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqLnRpbWUgPT09IG5vdGUuc3RhcnRUaW1lO1xuICAgIH0pWzBdO1xuICAgIHJldHVybiB7bGVmdDogZWRnZXMubGVmdCwgcmlnaHQ6IGVkZ2VzLnJpZ2h0fTtcbiAgfVxuXG4gIHZhciBub3RlWU1hcCA9IFtcbiAgICB7bm90ZTogXCJjNVwiLCB0b3A6IDAsIGJvdHRvbTogMzl9LFxuICAgIHtub3RlOiBcImI0XCIsIHRvcDogNDAsIGJvdHRvbTogNzl9LFxuICAgIHtub3RlOiBcImE0XCIsIHRvcDogODAsIGJvdHRvbTogMTE5fSxcbiAgICB7bm90ZTogXCJnNFwiLCB0b3A6IDEyMCwgYm90dG9tOiAxNTl9LFxuICAgIHtub3RlOiBcImY0XCIsIHRvcDogMTYwLCBib3R0b206IDE5OX0sXG4gICAge25vdGU6IFwiZTRcIiwgdG9wOiAyMDAsIGJvdHRvbTogMjM5fSxcbiAgICB7bm90ZTogXCJkNFwiLCB0b3A6IDI0MCwgYm90dG9tOiAyNzl9LFxuICAgIHtub3RlOiBcImM0XCIsIHRvcDogMjgwLCBib3R0b206IDMxOX1cbiAgXVxuXG4gIHZhciBub3RlWE1hcCA9IFtcbiAgICB7dGltZTogXCIwOjA6MFwiLCBsZWZ0OiAwLCByaWdodDogMzl9LFxuICAgIHt0aW1lOiBcIjA6MDoyXCIsIGxlZnQ6IDQwLCByaWdodDogNzl9LFxuICAgIHt0aW1lOiBcIjA6MTowXCIsIGxlZnQ6IDgwLCByaWdodDogMTE5fSxcbiAgICB7dGltZTogXCIwOjE6MlwiLCBsZWZ0OiAxMjAsIHJpZ2h0OiAxNTl9LFxuICAgIHt0aW1lOiBcIjA6MjowXCIsIGxlZnQ6IDE2MCwgcmlnaHQ6IDE5OX0sXG4gICAge3RpbWU6IFwiMDoyOjJcIiwgbGVmdDogMjAwLCByaWdodDogMjM5fSxcbiAgICB7dGltZTogXCIwOjM6MFwiLCBsZWZ0OiAyNDAsIHJpZ2h0OiAyNzl9LFxuICAgIHt0aW1lOiBcIjA6MzoyXCIsIGxlZnQ6IDI4MCwgcmlnaHQ6IDMyMH1cbiAgXVxuICBcbiAgTG9vcEZhY3RvcnkuZHJhd0xvb3AgPSBmdW5jdGlvbihsb29wKSB7XG4gICAgbG9vcC5ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vdGUpIHtcbiAgICAgIHZhciB4ID0gZ2V0WHZhbHMobm90ZSk7XG4gICAgICB2YXIgeSA9IGdldFl2YWxzKG5vdGUpO1xuICAgICAgTG9vcEZhY3RvcnkuYWRkTm90ZShudWxsLCB4LmxlZnQsIHgucmlnaHQsIHkudG9wKTtcbiAgICB9KVxuICB9XG5cbiAgTG9vcEZhY3RvcnkuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBjYW52YXMgZm9yIGEgOCAqIDggZ3JpZFxuICAgIGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKCdjJywgeyBcbiAgICAgICAgc2VsZWN0aW9uOiBmYWxzZVxuICAgICAgfSk7XG4gICAgY2FudmFzLnNldEhlaWdodCgzMjApO1xuICAgIGNhbnZhcy5zZXRXaWR0aCgzMjApO1xuICAgIGNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgICB2YXIgZ3JpZCA9IDQwO1xuXG4gICAgLy8gZHJhdyBsaW5lcyBvbiBncmlkXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAoMzIwIC8gZ3JpZCk7IGkrKykge1xuICAgICAgY2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWyBpICogZ3JpZCwgMCwgaSAqIGdyaWQsIDMyMF0sIHsgc3Ryb2tlOiAnI2NjYycsIHNlbGVjdGFibGU6IGZhbHNlIH0pKTtcbiAgICAgIGNhbnZhcy5hZGQobmV3IGZhYnJpYy5MaW5lKFsgMCwgaSAqIGdyaWQsIDMyMCwgaSAqIGdyaWRdLCB7IHN0cm9rZTogJyNjY2MnLCBzZWxlY3RhYmxlOiBmYWxzZSB9KSlcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgYSBuZXcgcmVjdGFuZ2xlIG9iaiBvbiBtb3VzZWRvd24gaW4gY2FudmFzIGFyZWFcbiAgICAvLyBjaGFuZ2UgdGhpcyB0byBhIGRvdWJsZS1jbGljayBldmVudCAoaGF2ZSB0byBhZGQgYSBsaXN0ZW5lcik/XG4gICAgY2FudmFzLm9uKCdtb3VzZTpkb3duJywgTG9vcEZhY3RvcnkuYWRkTm90ZSlcblxuICAgIC8vIHNuYXAgdG8gZ3JpZCB3aGVuIG1vdmluZyBvYmogKGRvZXNuJ3Qgd29yayB3aGVuIHJlc2l6aW5nKTpcbiAgICBjYW52YXMub24oJ29iamVjdDptb2RpZmllZCcsIExvb3BGYWN0b3J5LnNuYXBUb0dyaWQgKVxuXG4gIH1cblxuICBMb29wRmFjdG9yeS5zbmFwVG9HcmlkID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgY29uc29sZS5sb2coXCJvcHRpb25zXCIsIG9wdGlvbnMpXG4gICAgICBjb25zb2xlLmxvZygnb3B0aW9ucyB0YXJnZXQnLCBvcHRpb25zLnRhcmdldClcbiAgICAgIG9wdGlvbnMudGFyZ2V0LnNldCh7XG4gICAgICAgIGxlZnQ6IE1hdGgucm91bmQob3B0aW9ucy50YXJnZXQubGVmdCAvIGdyaWQpICogZ3JpZCxcbiAgICAgICAgdG9wOiBNYXRoLnJvdW5kKG9wdGlvbnMudGFyZ2V0LnRvcCAvIGdyaWQpICogZ3JpZFxuICAgICAgfSk7XG4gICAgICB2YXIgaWRDID0gY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpLmlkXG4gICAgICB2YXIgbm90ZVRvRGVsZXRlID0gbG9vcE11c2ljRGF0YVtpZENdO1xuICAgICAgZGVsZXRlIGxvb3BNdXNpY0RhdGFbaWRDXTtcbiAgICAgIFxuICAgICAgLy9kZWxldGUgb2xkIGV2ZW50XG4gICAgICBUb25lLlRyYW5zcG9ydC5jbGVhcihpZEMgLSAxNik7XG4gICAgICBsYXN0RXZlbnQgPD0gMCA/IGxhc3RFdmVudCA9IG51bGwgOiBsYXN0RXZlbnQtLTtcbiAgICAgIC8vbWFrZSBuZXcgb25lXG4gICAgICB2YXIgeFZhbCA9IE1hdGguY2VpbChvcHRpb25zLnRhcmdldC5vQ29vcmRzLnRsLngpXG4gICAgICBpZih4VmFsIDwgMCkgeFZhbCA9IDA7XG4gICAgICB2YXIgeVZhbCA9IE1hdGguY2VpbChvcHRpb25zLnRhcmdldC5vQ29vcmRzLnRsLnkpXG4gICAgICBpZih5VmFsIDwgMCkgeVZhbCA9IDA7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIng6IFwiLCB4VmFsLCBcInk6IFwiLCB5VmFsKVxuICAgICAgdmFyIG5ld09iamVjdElkID0gbmV3RXZlbnRJZCArIDE2O1xuICAgICAgdmFyIG5ld0V2ZW50SWQgPSBzY2hlZHVsZVRvbmUoeFZhbCwgeVZhbCwgbmV3T2JqZWN0SWQpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJuZXdFdmVudElkOiBcIiwgbmV3RXZlbnRJZCk7XG4gICAgICBuZXdJZEMgPSBjYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCkuc2V0KCdpZCcsIG5ld09iamVjdElkKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwibmV3IG9iaklkOiBcIiwgbmV3SWRDKTtcbiAgfVxuXG4gIExvb3BGYWN0b3J5LmFkZE5vdGUgPSBmdW5jdGlvbihvcHRpb25zLCBsZWZ0LCByaWdodCwgdG9wKXtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnRhcmdldCkge1xuICAgICAgc3ludGgudHJpZ2dlckF0dGFja1JlbGVhc2UoZ2V0UGl0Y2hTdHIob3B0aW9ucy5lLm9mZnNldFkpLCBcIjhuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBvZmZzZXRYID0gbGVmdCB8fCBvcHRpb25zLmUub2Zmc2V0WDtcbiAgICB2YXIgb2Zmc2V0WSA9IHRvcCB8fCBvcHRpb25zLmUub2Zmc2V0WVxuICAgIHZhciBuZXdPYmplY3RJZCA9IGxhc3RPYmpJZCsrO1xuXG4gICAgY2FudmFzLmFkZChuZXcgZmFicmljLlJlY3Qoe1xuICAgICAgICBpZDogbmV3T2JqZWN0SWQsXG4gICAgICAgIGxlZnQ6IE1hdGguZmxvb3Iob2Zmc2V0WCAvIDQwKSAqIDQwLFxuICAgICAgICByaWdodDogTWF0aC5mbG9vcihvZmZzZXRYIC8gNDApICogNDAsXG4gICAgICAgIHRvcDogTWF0aC5mbG9vcihvZmZzZXRZIC8gNDApICogNDAsXG4gICAgICAgIHdpZHRoOiA0MCwgXG4gICAgICAgIGhlaWdodDogNDAsIFxuICAgICAgICBmaWxsOiAnI2ZhYScsIFxuICAgICAgICBvcmlnaW5YOiAnbGVmdCcsIFxuICAgICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgICAgY2VudGVyZWRSb3RhdGlvbjogdHJ1ZSxcbiAgICAgICAgbWluU2NhbGVMaW1pdDogMCxcbiAgICAgICAgbG9ja1NjYWxpbmdZOiB0cnVlLFxuICAgICAgICBsb2NrU2NhbGluZ0ZsaXA6IHRydWUsXG4gICAgICAgIGhhc1JvdGF0aW5nUG9pbnQ6IGZhbHNlXG4gICAgICB9KVxuICAgICk7XG5cbiAgICB2YXIgbmV3SXRlbSA9IGNhbnZhcy5pdGVtKG5ld09iamVjdElkKTtcbiAgICBjYW52YXMuc2V0QWN0aXZlT2JqZWN0KG5ld0l0ZW0pO1xuICAgIC8vIGNvbnNvbGUubG9nKCdpZCBvZiBuZXcgb2JqOiAnLCBjYW52YXMuZ2V0QWN0aXZlT2JqZWN0KCkuZ2V0KCdpZCcpKTtcblxuICAgIC8vIHNvdW5kIHRvbmUgd2hlbiBjbGlja2luZywgYW5kIHNjaGVkdWxlXG4gICAgc3ludGgudHJpZ2dlckF0dGFja1JlbGVhc2UoZ2V0UGl0Y2hTdHIob2Zmc2V0WSksIFwiOG5cIik7XG4gICAgLy8gY29uc29sZS5sb2coJ29wdGlvbnMgZSBmcm9tIDEyNCcsIG9wdGlvbnMuZSlcbiAgICB2YXIgZXZlbnRJZCA9IHNjaGVkdWxlVG9uZShvZmZzZXRYLCBvZmZzZXRZLCBuZXdPYmplY3RJZCk7XG4gICAgLy8gY29uc29sZS5sb2coJ2lkIG9mIG5ldyB0cmFuc3BvcnQgZXZ0OiAnLCBldmVudElkKTtcblxuICAgIC8vaW5jcmVtZW50IGxhc3QgZXZlbnQgZm9yIGNsZWFyIGJ1dHRvblxuICAgIGxhc3RFdmVudCA9PT0gbnVsbCA/IGxhc3RFdmVudCA9IDAgOiBsYXN0RXZlbnQrKztcbiAgfVxuXG4gIExvb3BGYWN0b3J5LmRlbGV0ZU5vdGUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzZWxlY3RlZE9iamVjdElkID0gY2FudmFzLmdldEFjdGl2ZU9iamVjdCgpLmlkO1xuICAgIGNhbnZhcy5nZXRBY3RpdmVPYmplY3QoKS5yZW1vdmUoKTtcbiAgICBsYXN0T2JqSWQtLTtcbiAgICAvLyBhbHNvIGRlbGV0ZSB0b25lIGV2ZW50OlxuICAgIFRvbmUuVHJhbnNwb3J0LmNsZWFyKHNlbGVjdGVkT2JqZWN0SWQtMTYpO1xuICAgIC8vIGRlbGV0ZSBmcm9tIEpTT04gZGF0YSBzdG9yZVxuICAgIGRlbGV0ZSBsb29wTXVzaWNEYXRhW3NlbGVjdGVkT2JqZWN0SWRdO1xuICAgIGxhc3RFdmVudCA8PSAwID8gbGFzdEV2ZW50ID0gbnVsbCA6IGxhc3RFdmVudC0tO1xuICB9XG5cbiAgTG9vcEZhY3Rvcnkuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkYXRhVG9TYXZlID0gW107XG4gICAgZm9yICh2YXIgaSBpbiBsb29wTXVzaWNEYXRhKSB7XG4gICAgICBkYXRhVG9TYXZlLnB1c2gobG9vcE11c2ljRGF0YVtpXSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGRhdGFUb1NhdmUpO1xuICAgICRodHRwLnBvc3QoJy9hcGkvbG9vcHMnLCB7IG5vdGVzOiBkYXRhVG9TYXZlIH0pO1xuICB9XG5cbiAgcmV0dXJuIExvb3BGYWN0b3J5O1xuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9vcCcsIHtcbiAgICAgICAgdXJsOiAnL2xvb3AnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9vcENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvb3AvbG9vcC5odG1sJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGxvb3A6IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xvb3BzLzU2ZjA2Mjg3OTIxOTQyYTkyOTY5OWIxMCcpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnbG9vcHMnLCB7XG4gICAgICB1cmw6ICcvbG9vcHMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb29wL2xvb3BzLmh0bWwnXG4gICAgfSlcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdGdWxsc3RhY2tQaWNzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjdnQlh1bENBQUFYUWNFLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNzktWDdvQ01BQWt3N3kuanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRS1UNzVsV0FBQW1xcUouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRXZaQWctVkFBQWs5MzIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRWdOTWVPWElBSWZEaEsuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRVF5SUROV2dBQXU2MEIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQ0YzVDVRVzhBRTJsR0ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWVWdzVTV29BQUFMc2ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWFKSVA3VWtBQWxJR3MuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQVFPdzlsV0VBQVk5RmwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLU9RYlZyQ01BQU53SU0uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9COWJfZXJ3Q1lBQXdSY0oucG5nOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNVBUZHZuQ2NBRUFsNHguanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNHF3QzBpQ1lBQWxQR2guanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CMmIzM3ZSSVVBQTlvMUQuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cd3BJd3IxSVVBQXZPMl8uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cc1NzZUFOQ1lBRU9oTHcuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSjR2TGZ1VXdBQWRhNEwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSTd3empFVkVBQU9QcFMuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSWRIdlQyVXNBQW5uSFYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DR0NpUF9ZV1lBQW83NVYuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DSVM0SlBJV0lBSTM3cXUuanBnOmxhcmdlJ1xuICAgIF07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXG4gICAgICAgICdXZWxjb21lLiBUby4gV0VCU0lURS4nLFxuICAgICAgICAnOkQnLFxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nLFxuICAgICAgICAnR2ltbWUgMyBtaW5zLi4uIEkganVzdCBncmFiYmVkIHRoaXMgcmVhbGx5IGRvcGUgZnJpdHRhdGEnLFxuICAgICAgICAnSWYgQ29vcGVyIGNvdWxkIG9mZmVyIG9ubHkgb25lIHBpZWNlIG9mIGFkdmljZSwgaXQgd291bGQgYmUgdG8gbmV2U1FVSVJSRUwhJyxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xuICAgIH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0Fib3V0Jywgc3RhdGU6ICdhYm91dCcgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnRG9jdW1lbnRhdGlvbicsIHN0YXRlOiAnZG9jcycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTWVtYmVycyBPbmx5Jywgc3RhdGU6ICdtZW1iZXJzT25seScsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
