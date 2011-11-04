Running in browser
===================

Chrome/Chromimum
----------------

For best results run your browser with following options::

    --enable-benchmarking --js-flags "--expose_gc --flush_code --gc_global"

Details:

  * ``--enable-benchmarking`` exposes ``window.chrome.Interval`` which
  gives us at least microseconds precision (instead of milliseconds that
  Date can provide)
  
  * ``--js-flags`` passes options to the V8: ``--expose_gc`` adds ``window.gc``
  which forces the garbage collector to do it's work; ``--flush_code`` makes
  the GC collect (hopefuly) all of precompiled code; ``--gc_global`` makes the
  GC even more aggresive.


Running from CLI
=================

Node.js
--------

Node.js uses V8 engine, so the options are similar to the one we used 
for Chrome. Except for the timer thing which is a Chromium extension to
DOM. Instead we'll use ``microtime`` 
module <https://github.com/wadey/node-microtime>::

    $ npm install microtime

All other options are set in ``bench_config.json``.



