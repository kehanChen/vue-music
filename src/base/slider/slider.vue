<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
        <slot>
        </slot>
    </div>
    <div class="dots">
      <!--v-for多个变了，（）不是{}  -->
      <span class="dot" v-for="(item,index) in dots" v-bind:class="{active:
      currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript6">
  import BScroll from 'better-scroll'
  import {addClass} from 'common/js/dom'
export default {
  data() {
    return {
      dots: 0,
      // 当前第几页
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    },
    click: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      this._initSlider()
      // 要不要无所谓
      this._initDots()
      if(this.autoPlay) {
        this._play();
      }
    }, 20)
    // 优化，窗口大小改变时候，要动态改轮播图片的大小
    window.addEventListener('resize', () => {
      // 还没有来得及初始化加载数据时候不用重置宽度
      if(!this.slider) {
        return
      }
      this._setSliderWidth(true)
      // 重新计算宽度。这里没搞懂4-6章节的5-6分钟
      this.slider.refresh()
    })
  },
  methods: {
    //计算slider的宽度.isResize标记窗口重置时候，改变大小
    _setSliderWidth(isResize) {
      // ??这个chlidren值为什么在下面就是7了？算总的？
      this.children = this.$refs.sliderGroup.children
      if(!isResize && this.children) {
        this.dots = this.children.length
      }
      
      // console.log(this.children.length)
      let width = 0;
      let sliderWidth = this.$refs.slider.clientWidth
      for(let i=0; i<this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }

      if(this.loop && !isResize) {
        width += 2*sliderWidth
      }
      this.$refs.sliderGroup.style.width = width +'px'
    },
    // 初始化slider
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: true,
        snapLoop: this.loop,
        snapThreshold: 0.3,
        snapSpeed: 400
      })

      this.slider.on('scrollEnd',() => {
        let pageIndex = this.slider.getCurrentPage().pageX
        if(this.loop) {
          pageIndex -= 1
        }
        // console.log(pageIndex);
        this.currentPageIndex = pageIndex

        if(this.autoPlay) {
          clearTimeout(this.timer)
          this._play();
        }
      })
    },
    _initDots() {
      // console.log(this.children.length);
      // this.dots = new Array(this.children.length)
      // console.log(this.dots)
      // console.log(this.dots)
    },
    _play() {
      let pageIndex = this.currentPageIndex + 1
      if(this.loop) {
        pageIndex += 1
      }
      
      this.timer = setTimeout(() => {
        this.slider.goToPage(pageIndex,0,400)
      },this.interval)
    },
    // 代理一下方法
    refresh() {
        this.slider && this.slider.refresh()
    }
  },
  // 组件销毁时候，将定时器清除
  destroyed() {
    clearTimeout(this.timer)
  }
}
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
@import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>

