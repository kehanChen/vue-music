<!-- 音乐(歌曲)详情页组件，在歌单列表详情，歌手列表详情，排行列表详情里面都有用，里面插入歌曲列表基础组件 -->
<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <!--背景图的通过计算属性求到  -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <!-- 随机播放按钮 -->
      <div class="play-wrapper">
          <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
              <i class="icon-play"></i>
              <span class="text">随机播放全部</span>
          </div>
      </div>
      <!--模糊遮罩  -->
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 加个往上滚动和往下滚动时候的的遮挡层,歌曲列表往上滚，挡住图片下部分，往下滚拉下来  -->
    <div class="bg-layer" ref="layer"></div>
    <!-- 为了计算这个scroll组件的高度，传入song数据 .需要控制这个scroll的高度和滚动的情况，往上面是慢慢向上划的 -->
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
        <!--控制song-list组件的外框样式  -->
        <div class="song-list-wrapper">
            <!-- rank接收它父组件的rank，“rank”对应自己props里的rank  -->
            <song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
        </div>
        <!--loading组件  -->
        <div class="loading-container" v-show="!songs.length">
            <loading></loading>
        </div>
    </scroll>
  </div>
  
</template>

 <script type="text/ecmascript-6">
 import Scroll from "base/scroll/scroll"
 import SongList from "base/song-list/song-list"
// loading组件
import Loading from "base/loading/loading"
// 引入playlistMixin处理迷你播放器出来滚不到底部问题，重新刷新
import {playlistMixin} from 'common/js/mixin'
// 遮罩层最大高度偏移量.预留偏移量
const RESERVED_HEIGHT = 40

// 自动补前缀的函数
import {prefixStyle} from 'common/js/dom'
// 直接修改vuex里面state的东西
import {mapActions} from 'vuex'

const transform = prefixStyle('transform')
const backdrap = prefixStyle('backdrap-filter')
    export default {
        // 本组件同名handlePlaylist方法会覆盖playlistMixin里面的handlePlaylist.必须重置，不然会报错（自己设置的报错）
        mixins: [playlistMixin],
        // 初始化参数
        props: {
            bgImage: {
                type: String,
                default: ''
            },
            songs: {
                type: Array,
                default: []
            },
            title: {
                type: String,
                default: ''
            },
            // 穿进去给歌单详情页判断用的，用于判断左边是否出顺序
            rank: {
                type: Boolean,
                default: false
            }
        },
        // 维护一个纵向滚动的值
        data() {
            return {
                scrollY: 0
            }
        },
        computed: {
            bgStyle() {
                // console.log(this.bgImage)
                return `background-image:url(${this.bgImage})`
            }
        },
        mounted() {
            // vue对象(scroll实例化出来的对象)，先转成元素对象
            // console.log(this.$refs.list)
            // 下面要用this.$refs.bgImage.clientHeight
            this.imageHeight = this.$refs.bgImage.clientHeight
            this.$refs.list.$el.style.top = `${this.imageHeight}px`
        },
        // 监听滚动距离来位移bg-layer层
        created() {
            this.probeType = 3
            this.listenScroll = true
        },
        // 监听纵向滚动的距离
        methods: {
            // 重置playlist的定位底部
            handlePlaylist(playlist) {
                const bottom = playlist.length > 0 ? '60px' : ''
                this.$refs.list.$el.style.bottom =  bottom
                this.$refs.list.refresh()
            },
            scroll(pos) {
                this.scrollY = pos.y
            },
            back() {
                // 返回上一级，或者是bom的window.history.back()方法也一样的
                this.$router.back()
            },
            // 歌曲列表组件传过来点击事件 包括的歌曲数据和索引
            selectItem(item, index) {
                // console.log(index)
                this.selectPlay({
                    // 歌曲列表，需要拿到后面去处理。后面播放器需要歌曲列表
                    list: this.songs,
                    index: index
                })
            },
            // 随机播放
            random() {
                 this.selectPlay({
                    // 歌曲列表，需要拿到后面去处理。后面播放器需要歌曲列表
                    list: this.songs,
                    index: Math.floor(Math.random() * this.songs.length)
                })
            },
            // 代理，这样就能调用vuex的actions里面的函数（sotre里面）
            ...mapActions([
                'selectPlay'
            ])

        },
        watch: {
            scrollY(newY) {
                // 最大滚动距离，因为遮罩层高度为可视区高度，滚太高图片下面就慢慢出来了，挡不住了.let minTranslateY = this.imageHeight这句写在created里面可以减少监视的代码数量
                this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
                let translateY = Math.max(this.minTranslateY,newY)
                // transform用上面处理果的transform
                this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
                // this.$refs.layer.style['webkitTransfrom'] = `translate3d(0,${translateY}px,0)`
                // console.log(newY)
                let zIndex = 0
                // 当滚动到顶部时，因为有偏移量，要提高图片的层级
                if(newY < this.minTranslateY) {
                    zIndex = 10
                    this.$refs.playBtn.style.display = 'none'
                    this.$refs.bgImage.style.paddingTop = 0
                    this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
                } else {
                    zIndex = 0
                    this.$refs.playBtn.style.display = 'block'
                    this.$refs.bgImage.style.paddingTop = '70%'
                    this.$refs.bgImage.style.height = 0
                }
                
                // 如果拉出图片的高度的距离，那么图片放大
                let scale = 1
                // 放大比例
                const percent = Math.abs(newY/this.imageHeight)
                // 模糊度
                let blur = 0

                if(newY>0) {
                    scale = 1 + percent
                    zIndex = 10
                } else {
                    blur = Math.min(20 * percent, 20)
                }
                // 渐进模糊，只要ios支持
                // backdrap-filter用上面处理过的backdrap
                this.$refs.filter.style[backdrap] = `blur${blur}px`
                // this.$refs.filter.style['webkitBackdrap-filter'] = `blur${blur}px`
                this.$refs.bgImage.style.zIndex = zIndex
                this.$refs.bgImage.style[transform] = `scale(${scale})`
                // this.$refs.bgImage.style['webkitTransfrom'] = `scale(${scale})`
            }
        },
        components: {
            Scroll,
            SongList,
            Loading
        }

    }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
    
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
       
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>