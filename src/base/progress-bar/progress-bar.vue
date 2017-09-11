<!-- 进度条组件 -->
<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <!-- 当前进度的宽度  -->
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
// 拖动按钮的宽度
const progressBthWidth = 16
import {prefixStyle} from 'common/js/dom'
const transform = prefixStyle('transform')
export default {
    props: {
        // 百分比，自己可以拖的。时间与进度条对应
        percent: {
            type: Number,
            default: 0
        }
    },
    // 在touch不同操作的时候，需要的一些共享数据
    created() {
      this.touch = {}
    },
    methods: {
      progressTouchStart(e) {
        // 在拖动时候给个标记。拖动时候，自动播放改播放条就不要走了
        this.touch.init = true
        this.touch.startX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth
      },
      progressTouchMove(e) {
        if(!this.touch.init) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX
        // 最终拖动按钮的所在的位置.不能过大
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBthWidth,Math.max(0,this.touch.left + deltaX))
        this._offset(offsetWidth)
      },
      progressTouchEnd() {
        this.touch.init = false
        // 设置进度
        this._triggerPercent()
      },
      // 点击进度条
      progressClick(e) {
        // this._offset(e.offsetX)
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._triggerPercent()
      },
      // 滚动按钮的最终定位，监听(自动播放)和move都要用
      _offset(offsetWidth) {
        // 计算进度条宽度
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },
      // 设置拖动时候直接拖动的最终进度
      _triggerPercent() {
         const barWidth = this.$refs.progressBar.clientWidth - progressBthWidth
         const percent = this.$refs.progress.clientWidth / barWidth
        //  得到后要传出去，给自动播放的用
         this.$emit('percentChange', percent)
      }
    },
    watch: {
        // 监视百分比变化。自动播放时候才监视，拖动时候优先级无限高（不要改进度条位置了），要停一会，不然一拖就回头了
        percent(newpercent) {
            if(newpercent>=0 && !this.touch.init) {
                // 总宽度为进度条宽度减去按钮小球的宽度
                const barWidth = this.$refs.progressBar.clientWidth - progressBthWidth
                // 歌曲播放的比例
                const offsetWidth =newpercent * barWidth
                // 计算进度条宽度
                this._offset(offsetWidth)
            }
        }
    }
}


</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>