'use strict';

app.directive('loopItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/loop/loop.detail.html',
    scope: {
    	loop: '='
    },
    controller: function($scope, UserFactory){

        var synth = new Tone.PolySynth(16, Tone.SimpleSynth, {
            "oscillator" : {
                "partials" : [0, 2, 3, 4],
            },
            "volume" : -12
        }).toMaster();

        UserFactory.inBucket($scope.loop)
        .then(function(value){
            $scope.added=value;
            console.log("scope added", $scope.added)
        })

        $scope.playing = false;

        //E: added these two functions, directives should have ng-click="play()"...
        //E: use Tone.Emitter to emit a custom 'loop ended' event on last note? would be loop.notes[loop.notes.length - 1]...
        function scheduleLoop (loop) {
            var lastNote = new Tone.Emitter();
            lastNote.on('lastNote', function () {
                console.log('playing last note!');
                // Tone.Transport.stop();
                // $scope.playing = false;
            });

            console.log("loop: ", loop);
            loop.notes.forEach(function(note, noteIdx){
                Tone.Transport.scheduleOnce(function () {
                    synth.triggerAttackRelease(note.pitch, note.duration);
                    //condition to trigger 'last note' event
                    if (noteIdx === loop.notes.length - 1) lastNote.trigger('lastNote');
                }, note.startTime);
            });
        }

        $scope.play = function () {
            if ($scope.playing) {
              Tone.Transport.stop();
              $scope.playing = false;
            } else {
                scheduleLoop(loop);
                Tone.Transport.start();
                $scope.playing = true;
            }
        }

    	$scope.toggle = function(){
            //checker
    		if($scope.added) {
    			removeFromBucket()
    		} else {
    			addToBucket()
    		}
    		$scope.added=!$scope.added;
    	}

	    function addToBucket() {
			UserFactory.addToBucket($scope.loop)
		}
		function removeFromBucket() {
			UserFactory.removeFromBucket($scope.loop)
		}
    }
  };
});
