/***
 * Animate.js - v1.0.1 - Bios Sun <biossun@gmail.com>
 */
(function(scope, factory) {

    var Animate = factory(scope.requestAnimationFrame, scope.cancelAnimationFrame);

    if (typeof module === 'object' && module.exports === 'object') {
        module.exports = Animate;
    }
    else {
        scope.Animate = Animate;
    }

})(this, function(raf, caf) {

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

    // 无限循环关键字
    INFINITE = 'infinite',

    // 请求动画帧
    requestAnimationFrame = function(callback, time) {
        return raf ? raf(callback) : setTimeout(callback, FS);
    },

    // 取消一个已请求到的动画帧
    cancelAnimationFrame = function(id) {
        caf ? caf(id) : clearTimeout(id);
    };

    /**
     * 动画处理函数
     *
     * @param {object} options - 配置对象
     */
    function Animate( options ) {
        var t = this;

        t.isRun = false;              // 动画是否正在运行
        t.isPause = false;            // 动画是否暂停
        t.iterationCount = 0;         // 动画当前播放次数

        t._frameId = null;            // 动画所注册的帧的 ID
        t._playTime = 0;              // 动画播放时长

        options.easing = options.easing || Animate.easing.def;
        options.speed = SPEED[options.speed] || options.speed;
        options.iteration = options.iteration !== INFINITE && options.iteration < 1 ? 1 : options.iteration;

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
            t._frameId = requestAnimationFrame(step);

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
                    t._frameId = requestAnimationFrame(step);
                }
                // 完成动画
                else {
                    t.stop();
                    t.iterationCount++;

                    // 重复播放
                    if ( t.options.iteration === INFINITE || t.options.iteration > t.iterationCount ) {
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

            cancelAnimationFrame(t._frameId);

            t._callFun( 'pause', [t] );
        },

        /**
         * 结束动画
         *
         * @param {boolean} - isToEnding - 是否将动画立即完成，默认为 false。
         *                                 p.s. 无论动画是否立即完成，结束回调函数都会被调用。
         */
        stop : function( isToEnding ) {
            var t = this;

            if (t.isRun === false && t.isPause === false) {
                return;
            }

            if ( isToEnding ) {
               t._frame( 1 );
            }

            t.isRun = false;
            t.isPause = false;
            t._playTime = 0;

            cancelAnimationFrame(t._frameId);

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
            var t = this,
                fun = t.options[name];

            if ( typeof fun === 'function' ) {
                fun.apply( t, params );
            }
            else if ( typeof fun === 'object' && typeof fun.length === 'number' ) {  // array
                for ( var i = 0; i < fun.lenght; i++ ) {
                    fun[i].apply( t, params );
                }
            }
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
