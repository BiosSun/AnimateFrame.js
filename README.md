# AnimateFrame.js

AnimateFrame.js 是一个非常小的 JS 动画框架库，其核心部分压缩后仅 **1.7kb**，而加上其缓动动画扩展相关的代码，也只有不到 `5kb` 的大小。

## 理念

AnimateFrame.js 期望抽象出一组**动画控制逻辑**，并同时保持自身足够得轻量小巧，通过保证这两点，使其可以集成在**任何项目**中并为其提供动画支持，如应用在 DOM 元素动画、Canvas 动画等**任何目标**的动画效果的实现上。

该库所提供的控制逻辑有如下 5 个：

- 播放：用于开始播放动画；
- 暂停：用于在动画播放过程中暂停播放；
- 继续：用于在动画播放暂停之后继续播放；
- 结束：用于直接结束动画播放；
- 跳转：用于跳转到动画播放的任一时间节点；
- 循环：用于控制循环播放动画。

## 示例

```
var box = document.getElementById('box');
 
var animate = new AnimateFrame({
    speed: 1000,   // or 'slow', 'normal', 'fast'
    easing: 'linear',  // !optional
    iteration: 1,      // !optional
 
    // 动画开始时的回调函数
    begin: function() {
        box.style.left = '0px';
    }
 
    // 动画进行中每一帧的回调函数
    frame: function(progress, easing) {
        box.style.left = (100 * easing) + 'px';
    },
 
    // 动画完成时的回调函数
    finish: function() {
        box.style.left = '100px';
    },
 
    // 动画暂停时的回调函数
    pause: function() {}
});
 
animate.run();    // 开始动画
animate.pause();    // 暂停动画
```

## 接口

### new AnimateFrame(options)

创建一个动画对象。

#### 参数

##### `options` {object}

配置对象，支持配置项如下：

- `speed {number | 'slow' | 'normal' | 'fast'}` - 动画时长，以毫秒为单位，另外也可以使用预定的速度关键字。
- `easing {string}` - 动画缓动效果，核心库只提供 `linear` 及 `swing` 两种效果，默认为 `swing`。若需更多效果，可以额外加载动画扩展库。
- `iteration {number | 'infinite'}` - 动画播放次数，可将其指定为 `'infinite'` 以开启无限循环模式。默认为 `1`。
- `begin {function()}` - 播放开始时的回调函数；将在动画开始前（既第一帧前）执行。
- `finish {function()}` - 播放结束时的回调函数，将在动画结束后（既最后一帧后）执行。
- `pause {function()}` - 播放暂停时的回调函数，将在暂停功能触发后执行。
- `frame {function(progress, easing)}` - 帧计算回调函数；将在动画播放到每一帧时回调该函数，通过该函数，您可以渲染相关的动画目标。其中有两个参数：`progress` 表示当前播放进度，其值在 [0, 1] 区间内，`easing` 表示当前的缓动进度，在有的缓动效果中，其值有可能超出 [0, 1] 区间的范围。

### animate.run()

播放动画，若当前播放被暂停，则会在暂停的位置继续播放。

### animate.pause()

暂停动画。

### stop(isToEnd)

结束动画。

#### 参数

##### `isToEnding` {boolean}

是否立即完成动画。默认为 false。

p.s.

无论是否立即完成，都会触发 `finish` 回调函数。

