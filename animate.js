// Animate.js
//
// 动画控制
//
// @author: Bios Sun <biossun@gmail.com>
// @date: 2013-06-13
// @update: 2015-01-27 使用 window.requestAnimationFrame
(function AnimateInit() {

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
     *   target : {*} :
     *     应用动画的对象
     *
     *   speed : {Number, ["slow", "normal", "fast"]} :
     *     动画时长；数值类型，以毫秒为单位；另外也可以使用预定的速度关键字字符串。
     *
     *   easing : {String} : 'linear'
     *
     *   iteration : {Number, ["infinite"]} : 1
     *     动画执行次数，另外也可以使用预定关键字字符串“infinite”来设定动画无限循环。
     *
     *   into : {Function} :
     *     初始化函数；将在动画开始前（第一帧计时开始时）执行。
     *
     *   frame : {Function} :
     *     帧计算函数；将在动画每一帧计时结束后执行。
     *
     *   over : {Function} :
     *     清理函数；将在动画结束后（最后一帧完成时）执行；
     *
     *   suspend : {Function} :
     *     暂停处理函数；将在动画暂停时执行；
     */
    function Animate( options ) {
        var t = this;

        t.target = options.target;    // 动画应用目标对象
        t.isRun = false;              // 动画是否正在运行
        t.isSuspend = false;          // 动画是否暂停
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

            if ( !t.isSuspend ) {
                this._callFun( 'init', [t.target, t] );
            }
            else {
                t.isSuspend = false;
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
                    t.over();
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
        suspend : function() {
            var t = this;

            clearTimeout(t._timeout);
            t.isSuspend = true;

            t._callFun( 'suspend', [t.target, t] );
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
        over : function( toEnd ) {
            var t = this;

            if ( toEnd ) {
               t._frame( 1 );
            }

            clearTimeout(t._timeout);

            t.isRun = false;
            t.isSuspend = false;
            t._playTime = 0;

            t._callFun( 'over', [t.target, t] );
        },

        /**
         * 执行动画帧
         */
        _frame : function( progress ) {
            var t = this;
            t._callFun( 'frame', [t.target, progress, Animate.easing[t.options.easing]( progress, 0, 1, 1 ), t] );
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
        def : 'linear',

        linear : function( t, b, c, d ) {
            return t;
        }
    };

    window.Animate = Animate;
})(window);
