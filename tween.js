//------------------------------
// Tween
//------------------------------

Tween = (function() {

  //------------------------------
  // Constants
  //------------------------------

  var PI = Math.PI;
  var acos = Math.acos;
  var pow = Math.pow;
  var cos = Math.cos;
  var sin = Math.sin;
  var raf = requestAnimationFrame;
  var caf = cancelAnimationFrame;

  //------------------------------
  // Helpers
  //------------------------------

  function isFunction(object) {
    return Object.prototype.toString.call(object) == '[object Function]';
  }

  function trigger(callbacks, callback) {
    if (isFunction(callback)) {
      callbacks.push(callback);
    } else {
      if (callbacks.length) {
        var params = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, n = callbacks.length; i < n; i++) {
          callbacks[i].apply(null, params);
        }
      }        
    }
  }

  function ease(core) {
    core.in = core;
    core.out = function(t) {
      return 1 - core(1 - t);
    };
    core.inOut = function(t) {
      return t <= 0.5 ? core(t * 2) / 2 : (2 - core(2 * (1 - t))) / 2;
    };
    return core;
  }

  function copy(target, options) {
    var result = {};
    for (var key in options) {
      result[key] = target[key];
    }
    return result;
  }

  function now() {
    return performance.now();
  }

  //------------------------------
  // Prototype
  //------------------------------

  function Tween(target, duration, options) {
    this.startTime = now();
    this.duration = duration;
    this.options = options;
    this.target = target;
    this.easing = API.Linear;
    this.onStart = [];
    this.onStep = [];
    this.onDone = [];
    this.progress = 0;
    this.paused = false;
    this.alive = true;
    this.delay = 0;
  }

  Tween.prototype = {

    wait: function(delay) {
      this.delay = delay;
      return this;
    },

    ease: function(callback) {
      this.easing = callback;
      return this;
    },

    kill: function() {
      this.alive = false;
      return this;
    },

    start: function(callback) {
      trigger(this.onStart, callback);
      return this;
    },

    pause: function() {
      if (!this.paused) {
        this.pauseTime = now();
        this.paused = true;
      }
    },

    play: function() {
      if (this.paused) {
        this.startTime += now() - this.pauseTime;
        this.paused = false;
      }
    },
    
    step: function(callback) {
      trigger(this.onStep, callback);
      return this;
    },

    done: function(callback) {
      trigger(this.onDone, callback);
      return this;
    }
  };

  //------------------------------
  // Engine
  //------------------------------

  var running = false;
  var tweens = [];
  var req;

  function update() {
    
    if (running) {

      var tween, delta, key, a, b;

      for (var i = tweens.length - 1; i >= 0; i--) {
        
        tween = tweens[i];

        if (tween.alive) {

          delta = (now() - tween.startTime) * 0.001;

          if (delta > tween.delay && !tween.paused) {
            
            if (tween.progress === 0) {
              tween.initial = copy(tween.target, tween.options); 
              trigger(tween.onStart, tween);
            }

            tween.progress = (delta - tween.delay) / tween.duration;
            tween.progress = Math.max(0.0, Math.min(tween.progress, 1.0));

            for (key in tween.options) {
              a = tween.initial[key];
              b = tween.options[key];
              tween.target[key] = a + (b - a) * tween.easing(tween.progress);
            }

            trigger(tween.onStep, tween);
          }

          if (tween.progress >= 1.0) {
            tween.alive = false;
            trigger(tween.onDone, tween);
          }  
        }

        if (!tween.alive) {
          tweens.splice(i, 1);
        }
      }

      if (tweens.length) {
        req = raf(update);
      } else {
        running = false;
      }
    }
  }

  function start() {
    if (!running) {
      req = raf(update);
      running = true;
    }
  }

  function stop() {
    running = false;
    caf(req);
  }

  function queue(tween) {
    tweens.push(tween);
    start();
    return tween;
  }

  //------------------------------
  // API
  //------------------------------

  var API = {

    Linear: ease(function(t) {
      return t;
    }),

    Elastic: ease(function(t) {
      return pow(2, 10 * --t) * cos(20 * t * PI * 1 / 3 );
    }),

    Bounce: ease(function(t) {
      for (var n, a = 0, b = 1; 1; a += b, b /= 2) {
        if (t >= (7 - 4 * a) / 11){
          n = -pow((11 - 6 * a - 11 * t) / 4, 2) + b * b;
          break;
        }
      }
      return n;
    }),

    Back: ease(function(t) {
      return pow(t, 2) * ((1.618 + 1) * t - 1.618);
    }),

    Sine: ease(function(t) {
      return 1 - sin((1 - t) * PI / 2);
    }),

    Circ: ease(function(t) {
      return 1 - sin(acos(t));
    }),

    Expo: ease(function(t) {
      return pow(2, 10 * (t - 1));
    }),

    Quad: ease(function(t) {
      return pow(t, 2);
    }),

    Cubic: ease(function(t) {
      return pow(t, 3);
    }),

    Quart: ease(function(t) {
      return pow(t, 4);
    }),

    Quint: ease(function(t) {
      return pow(t, 5);
    }),

    to: function(target, duration, options) {
      var tween = new Tween(target, duration, options);
      return queue(tween);
    }
  };

  return API;

})();