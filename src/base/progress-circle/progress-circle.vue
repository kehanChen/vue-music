<!--播放器最小化时候的圆形进度条-->
<template>
  <div class="progress-circle">
    <!-- 高度不要写死，方便多个调用  -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- 内存圆 -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!-- 外层圆 .srtoke-dasharray周长，stroke-dashoffset填充的 -->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
    props: {
        radius: {
            type: Number,
            default: 100
        },
        // 用来算stroke-dashoffset填充的周长
        percent: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            dashArray:  Math.PI*100
        }
    },
    computed: {
        dashOffset() {
            return (1-this.percent) * this.dashArray
        }
        
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-e
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>