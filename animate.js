/***
 * Animate.js 用于管理单个动画播放，支持暂停，继续，延迟播放，立即结束等相关操作。
 * 同时会提供大量事件用于监听动画播放中的每一个状态改变。
 *
 * ## 动画状态
 * - 未开始：动画刚创建时处于未开始状态，可使用 run() 方法执行该动画
 * - 执行中：当调用 run() 方法后，动画处于正在执行中状态
 * - 暂停：在动画执行中时，如果调用 pause() 方法，动画将会暂停播放，此时处于暂停状态，暂停后可调用 resume() 方法继续播放动画。
 * - 结束：在动画播放完成后，将处于结束状态，一个动画只能播放以此，因此结束后的动画不能再次播放。
 *
 * ## 关于动画队列
 * Animate 的目的是用于管理单个动画操作，而队列管理是另外一件事情，因此不会支持（当然也不支持 Promise）。
 * 在文档中有提供一个使用 Promise 编写的队列管理模块，可以以此为参考自行实现。
 *
 * @author: Bios Sun <biossun@gmail.com>
 *
 * @example
 *     var box = document.getElementById('box');
 *
 *     var animate = new Animate({
 *         speed: 1000,   // or 'slow', 'normal', 'fast'
 *         easing: 'linear',  // !optional
 *         iteration: 1,      // !optional
 *
 *         // 动画开始时的回调函数
 *         begin: function() {
 *             box.style.left = '0px';
 *         }
 *
 *         // 动画进行中每一帧的回调函数
 *         frame: function(progress, easing) {
 *             box.style.left = (100 * easing) + 'px';
 *         },
 *
 *         // 动画完成时的回调函数
 *         finish: function() {
 *             box.style.left = '100px';
 *         },
 *
 *         // 动画暂停时的回调函数
 *         pause: function() {}
 *     });
 *
 *     animate.run();    // 开始动画
 *     animate.pause();    // 暂停动画
 *
 */
(function(scope, factory) {

    var Animate = factory(undefined);

    if (typeof module === 'object' && module.exports === 'object') {
        module.exports = Animate;
    }
    else {
        scope.Animate = Animate;
    }

})(this, function(undefined) {

    'use strict';

    var

    // 每秒帧数
    FPS = 77,

    // 动画速度关键字
    SPEED = {
        slow : 600,
        fast : 200,
        normal : 400
    },

    // 帧间时长，由FPS计算而来。
    FS = Math.floor(1000 / FPS),

    _hasown = Object.prototype.hasOwnProperty;

    /**
     * 动画处理函数
     *
     * @params:
     *   options : {Object} :
     *     配置对象
     *
     * @options:
     *
     *   speed : {Number, ["slow", "normal", "fast"]} :
     *     动画时长；数值类型，以毫秒为单位；另外也可以使用预定的速度关键字字符串。
     *
     *   easing : {String} : 'linear'
     *
     *   iteration : {Number, ["infinite"]} : 1
     *     动画执行次数，另外也可以使用预定关键字字符串“infinite”来设定动画无限循环。
     *
     *   begin : {Function} :
     *     初始化函数；将在动画开始前（第一帧计时开始时）执行。
     *
     *   frame : {Function} :
     *     帧计算函数；将在动画每一帧计时结束后执行。
     *
     *   finish : {Function} :
     *     清理函数；将在动画结束后（最后一帧完成时）执行；
     *
     *   pause : {Function} :
     *     暂停处理函数；将在动画暂停时执行；
     */
    function Animate( options ) {
        var t = this;

        t.isRun = false;              // 动画是否正在运行
        t.isPause = false;            // 动画是否暂停
        t.iterationCount = 0;         // 动画当前播放次数

        t._timeout = null;            // 动画计时器
        t._playTime = 0;              // 动画播放时长

        options.easing = options.easing || Animate.easing.def;
        options.speed = _hasown.call(SPEED, options.speed) ? SPEED[options.speed] : options.speed;
        options.iteration = options.iteration !== 'infinite' && options.iteration < 1 ? 1 : options.iteration;

        t.options = options;
    }

    Animate.prototype = {
        constructor : Animate,

        /**
         * 执行动画
         */
        run : function() {
            var t = this, lastFrameTime;

            if ( t.isRun ) {
                return false;
            }

            if ( !t.isPause ) {
                this._callFun( 'begin', [t] );
            }
            else {
                t.isPause = false;
            }

            t.isRun = true;
            lastFrameTime = new Date();
            t._timeout = setTimeout(step, FS);

            return true;

            function step() {
                var now = new Date(), progress;

                t._playTime += now - lastFrameTime;          // 播放时长
                progress = t._playTime / t.options.speed;    // 进度百分比

                progress = Math.min(progress, 1);  // 防止百分比数值溢出

                t._frame(progress);  // 执行帧

                // 继续执行动画
                if ( progress < 1 ) {
                    lastFrameTime = now;
                    t._timeout = setTimeout( step, FS );
                }
                // 完成动画
                else {
                    t.stop();
                    t.iterationCount++;

                    // 重复播放
                    if ( t.options.iteration === 'infinite' || t.options.iteration > t.iterationCount ) {
                        t.run();
                    }
                    else {
                        t.iterationCount = 0;
                    }
                }
            }
        },

        /**
         * 暂停动画
         */
        pause : function() {
            var t = this;

            if (t.isPause || t.isRun === false) {
                return;
            }

            t.isRun = false;
            t.isPause = true;

            clearTimeout(t._timeout);

            t._callFun( 'pause', [t] );
        },

        /**
         * 结束动画
         *
         * @params:
         *   toEnd : {Boolean} : false
         *     是否将动画立即完成。
         *
         *     p.s.
         *     无论动画是否立即完成，结束回调函数都会被调用。
         */
        stop : function( toEnd ) {
            var t = this;

            if (t.isRun === false && t.isPause === false) {
                return;
            }

            if ( toEnd ) {
               t._frame( 1 );
            }

            t.isRun = false;
            t.isPause = false;
            t._playTime = 0;

            clearTimeout(t._timeout);

            t._callFun( 'finish', [t] );
        },

        /**
         * 执行动画帧
         */
        _frame : function( progress ) {
            var t = this;
            t._callFun( 'frame', [progress, Animate.easing[t.options.easing]( progress, 0, 1, 1 ), t] );
        },

        /**
         * 执行回调函数
         */
        _callFun : function( name, params ) {
            var fun = this.options[name],
                r = true;

            if ( typeof fun === 'function' ) {
                fun.apply( this, params );
            }
            else if ( typeof fun === 'object' && typeof fun.length === 'number' ) {  // array
                for ( var i = 0, l = fun.lenght; i < l; i++ ) {
                    fun[i].apply( this, params );
                }
            }
            else {
                r = false;
            }

            return r;
        }
    };

    Animate.easing = {
        def : 'swing',

        linear : function( t, b, c, d ) {
            return t;
        },

        swing: function( t, b, c, d ) {
            return 0.5 - Math.cos( t * Math.PI ) / 2;
        }
    };

    return Animate;
});
