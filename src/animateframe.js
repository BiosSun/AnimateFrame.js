import swing from './easing/swing';

const g = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;

const raf = g && g.requestAnimationFrame;
const caf = g && g.cancelAnimationFrame;

// 每秒帧数
const FPS = 77;

// 动画速度关键字
const SPEED = {
    slow : 600,
    fast : 200,
    normal : 400
};

// 帧间时长，由FPS计算而来。
const FS = Math.floor(1000 / FPS);

// 无限循环关键字
const INFINITE = 'infinite';

// 默认缓动动画
const DEFAULT_EASING = swing;

// 请求动画帧
const requestAnimationFrame = raf  || function(callback) {
    return setTimeout(callback, FS);
};

// 取消已请求到的动画帧
const cancelAnimationFrame = caf || function(id) {
    clearTimeout(id);
};

/**
 * 动画处理函数
 *
 * @param {object} options - 配置对象
 */
export default function AnimateFrame( options ) {
    const t = this;

    t.isRun = false;              // 动画是否正在运行
    t.isPause = false;            // 动画是否暂停
    t.iterationCount = 0;         // 动画当前播放次数

    t._frameId = null;            // 动画所注册的帧的 ID
    t._playTime = 0;              // 动画播放时长

    options.easing = options.easing || DEFAULT_EASING;
    options.speed = SPEED[options.speed] || options.speed;
    options.iteration = options.iteration !== INFINITE && options.iteration < 1 ? 1 : options.iteration;

    t.options = options;
}

AnimateFrame.prototype = {
    constructor : AnimateFrame,

    /**
     * 执行动画
     */
    run : function() {
        const t = this;
        let lastFrameTime;

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
            const now = new Date();
            let progress;

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
        const t = this;

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
        const t = this;

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
        const t = this;
        t._callFun( 'frame', [progress, t.options.easing( progress, 0, 1, 1 ), t] );
    },

    /**
     * 执行回调函数
     */
    _callFun : function( name, params ) {
        const t = this;
        const fun = t.options[name];

        if ( typeof fun === 'function' ) {
            fun.apply( t, params );
        }
        else if ( typeof fun === 'object' && typeof fun.length === 'number' ) {  // array
            for (let key in fun) {
                fun[key].apply( t, params );
            }
        }
    }
};
