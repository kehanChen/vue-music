<!-- 播放器组件,放在app.vue下面 -->
<template>
  <div class="player" v-show="playlist.length>0"
   
  >
    <!-- 加动画的,VUE自带的js动画钩子  -->
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper" >
              <!-- 专辑旋转 -->
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <!--当前播放的歌词  -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- 歌词界面。传入数据，让scroll组件自动刷新  -->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric ? currentLyric.lines : []">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                    class="text"
                    :class="{'current': currentLineNum === index}"
                    v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <!--左右滑动的标记。歌词，CD切换  -->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <!-- 歌曲进度条时间什么的。需要数据  -->
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <!-- 进度条下面的按钮  -->
          <div class="operators">
            <!-- 改变播放模式  -->
            <div class="icon i-left" @click="changeMode">
              <!-- 播放模式的图标 -->
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentSong)"
                @click="toggleFavorite(currentSong)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control" :class="disableCls">
          <!-- 传下半径 ,radius固定值直接传就行了，但是直接传是字符串,data里面定义一下 -->
          <progress-circle :radius="radius" :percent="percent">
            <i class="icon-mini" :class="miniIcon" @click.stop="togglePlaying" ></i>
          </progress-circle>
        </div>
        <!-- 不要父容器冒泡起来 -->
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 播放列表  -->
    <playlist ref="playlist"></playlist>
    <!-- 可播放会派发canplay，不能播放时候有error,歌曲播放时派发事件timeupdate,结束时候派发ended。-->
    <audio :src="currentSong.url" ref="audio" @play="ready" @error="error" @timeupdate="updataTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters,mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import ProgressBar from 'base/progress-bar/progress-bar'
// 自动补前缀的函数
import {prefixStyle} from 'common/js/dom'
const transform = prefixStyle('transform')
const transition = prefixStyle('transition')
// 圆形的播放进度的组件
import ProgressCircle from 'base/progress-circle/progress-circle'
// 播放模式的引入
import {playMode} from 'common/js/config'
// 打乱数组
import {shuffle} from 'common/js/util'
// 引入歌词播放插件
import Lyric from 'lyric-parser'
// 歌词要滚动
import Scroll from 'base/scroll/scroll'
// 歌曲列表组件
import Playlist from 'components/playlist/playlist'
// 播放列表和播放器共享我喜欢的操作
import {playerMixin} from 'common/js/mixin'
export default {
  mixins: [playerMixin],
  // 返回数据用于控制上下切换，因为切的太快没加载好会报错的
  data() {
    return {
      songReady: false,
      currentTime: 0,
      // 圆形播放进度的直径
      radius: 32,
      // 默认歌词
      currentLyric: null,
      // 当前歌词所在的行
      currentLineNum: 0,
      // 当前是应该歌词还是CD显示的控制量
      currentShow: 'cd',
      // 当前播放的歌词,回调时候改掉
      playingLyric: ''
    }
  },
  computed: {
    // 计算CD旋转
    cdCls() {
      return this.playing ? 'play' : 'play pause'
    },
    // 计算play的状态来给playicon确定图标
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    // 播放模式，先改图标，再改playlsit数据
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : (this.mode === playMode.loop ? 'icon-loop' : 'icon-random' )
    },
    miniIcon() {
      
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    // 不能点击的时候.改个状态
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    // 计算当前歌曲播放的进度百分，传入子组件progressBar和圆形进度条里面
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    // 里面和vuex的state里面的数据映射关系（store）
    ...mapGetters([
      'currentIndex',
      'playlist',
      'fullScreen',
      'currentSong',
      // 获取音乐播放状态
      'playing',
      // 播放模式
      'mode',
      // 原始的列表
      'sequenceList',
      'playHistory'
    ])
  },
  created() {
    this.touch = {}
  },
  methods: {
    back() {
      // 播放器小屏，不能直接修改this.fullScreen.因为在vuex里的state里面.要映射一层
      this.setFullScreen(false)
    },
    open() {
      // 播放器大屏
      this.setFullScreen(true)
    },
    // 传元素，动画动作.用CSS写.用create-keyframe-animation插件
    enter(el, done) {
      const {x,y,scale} = this._getPosAndScale()
      // 定义
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      // 注册.组件带的
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      // 运行.done是回调，会跳到afertEnter
      animations.runAnimation(this.$refs.cdWrapper, 'move' ,done)
    },
    afterEnter() {
      // 把enter的动画销毁
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      const {x,y,scale} = this._getPosAndScale()
      // 定义
      let animation = {
        0: {
          transform: `translate3d(0,0,0) scale(1)`
        },
        20: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        }
      }
      // 注册.组件带的
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      // 运行.done是回调，会跳到afterLeave
      animations.runAnimation(this.$refs.cdWrapper, 'move' ,done)
    },
    afterLeave() {
      // 把enter的动画销毁
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    // 得到播放器小图片的当前高度，计算飞上去的距离
    _getPosAndScale() {
      // 播放器小图片的宽度
      const targetWidth = 40
      // 播放器小图片的偏移
      const paddingLeft = 40
      // 距离底部距离
      const paddingBottom = 30
      // 大图片的顶部距离
      const paddingTop = 80
      // 大图片的宽度
      const width = window.innerWidth * 0.8
      // 初始缩放比例，小图片和图片的之比
      const scale = targetWidth/width
      // 大图片到小图片的x轴偏移量
      const x = -(window.innerWidth/2 - paddingLeft)
      // 大图片到小图片的y轴偏移量
      const y = window.innerHeight - paddingTop - width/2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    // 映射出来一个方法，去修改fullscreen.playingList,currentIndex
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    }),
    // 控制音乐播放暂停.记得把歌词的定时器也暂停
    togglePlaying() {
      if(!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if(this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    // 歌曲播放完之后切歌.播放模式判断一下。单曲循环不变
    end() {
      // 搜索时候应该加在最近常听里面。如果第一次点，就是一首歌的长度，应该无限循环。todo
      if(this.playlist.length === 1) {
         this.loop()
         return
      }
      if(this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    // 单曲循环.结束了把时间置零，重来一遍.歌词也要重新来一遍
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
       if(this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    // 上一首下一首
    next() {
      if(!this.songReady) {
        return
      }
       // 搜索时候应该加在最近常听里面。如果第一次点，就是一首歌的长度，应该无限循环。todo
      if(this.playlist.length === 1) {
         this.loop()
         return
      }
      let index = 0
      if(this.mode === playMode.random) {
        index = this.randomPlay()
      } else {
        index = this.currentIndex + 1
        // 过节处理
        if(index === this.playlist.length) {
          index = 0
        }
      }
      this.setCurrentIndex(index)
      if(!this.playing) {
        this.togglePlaying()
      }
      // this.setPlayingState(true)
      // 点了之后songReady改成flase，再就位再成true
      this.songReady = false
    },
    prev() {
      if(!this.songReady) {
        return
      }
       // 搜索时候应该加在最近常听里面。如果第一次点，就是一首歌的长度，应该无限循环。todo
      if(this.playlist.length === 1) {
         this.loop()
         return
      }
      let index = 0
      if(this.mode === playMode.random) {
        index = this.randomPlay()
      } else {
        index = this.currentIndex - 1
        // 过节处理
        if(index === -1) {
          index = this.playlist.length -1
        }
      }
      this.setCurrentIndex(index)
      if(!this.playing) {
        this.togglePlaying()
      }
      // this.setPlayingState(true)
      this.songReady = false
    },
    // 随机播放
    randomPlay() {
      let index = Math.floor(Math.random()*this.playlist.length)
      return index
    },
    // 歌曲加载了，可以播放了
    ready() {
      this.songReady = true
      // 将播放的歌曲写入最近播放的历史记录
      
      this.savePlayHistory(this.currentSong)
      // console.log(this.playHistory)
    },
    ...mapActions([
      'savePlayHistory'
    ]),
    // 错误时候。断网啊，地址错了的时候有用，加载失败
    error() {
      this.songReady = true
    },
     // audio播放时候派发的事件回调
    updataTime(e) {
      // 可读可写。一个带很多小数的时间，只记几秒。处理一下
      this.currentTime = e.target.currentTime

    },
    // 组织时间的格式的
    format(interval) {
      // 或0，相当于向下取整
      interval = interval | 0
      const minute = interval/60 | 0
      const second = this._pad(interval%60)
      return `${minute}:${second}`
    },
    // 补零
    _pad(num) {
      return num<10 ? '0'+num : ''+num
    },
    // 进度条拖动结束事件（子组件派发出来的，传出来一个拖到位置的百分比）.歌词位置也要改变.就是拖到的时间乘以1000毫秒
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      // 如果暂停的话，拖的时候让它播放
      if(!this.playing) {
        this.togglePlaying()
      }
      if(this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    // 改变播放模式.先改图标，最关键的是修改列表
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      // let list = null
      // if(mode === playMode.random) {
      //   // list = shuffle(this.playlist)
      // } else {
      //   // list = this.sequenceList
      // }
      
      // 改掉playlist.当前播放是不变的，currentIndex处理下.变成对应的索引值
      // this.setPlaylist(list)
      // this.resetCurrentIndex(list)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.name === this.currentSong.name
      })
      console.log(index)
      this.setCurrentIndex(index)
    },
    // 获取歌词的方法.获取之后才能干后面的事情
    getLyric() {
      this.currentSong.getLyric().then((lyric) => {
        // 里面靠计时器切换歌词的，换歌的时候要把上一个lyric实例化对象里面的计时器清掉
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        // 在播放时候，让歌词滚动
        if(this.playing){
          this.currentLyric.play()
        }
        // console.log(this.currentLyric)
      }).catch(() => {
        // 异常时候，没获取到歌词时候。把默认参数还原
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // 歌词实例化对象的回调，让歌词滚动起来.lineNum第几行，txt歌词文案
    handleLyric({lineNum, txt}) {
        // 设置当前歌词是第几行
        this.currentLineNum = lineNum
        // 前五行不用滚动
        if(lineNum>5) {
          // 当前元素减去5
          let lineEl = this.$refs.lyricLine[lineNum-5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        // 当前播放歌词的赋值
        this.playingLyric = txt
    },
    // 左右划屏显示是显示歌词还是CD
    middleTouchStart(e) {
      this.touch.init = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e) {
      if(!this.touch.init) {
        return
      }
      // 歌词是滚动的，当上下滚动大于左右滚动，不应该切换
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if(Math.abs(deltaY)>Math.abs(deltaX)) {
        return
      } 
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0,Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transition] = 0
      // 华东越大，透明度越小，显示的越淡
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transition] = 0
    },
    middleTouchEnd() {
      let offsetWidth
      let opacity
      if(this.currentShow === 'cd') {
        if(this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if(this.touch.percent <0.9) {
          offsetWidth = 0
          opacity = 1
          this.currentShow = 'cd'
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transition] = `${time}ms`
      // CD的透明度
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transition] = `${2*time}ms`
    },
    //播放列表的显示
    showPlaylist() {
      this.$refs.playlist.show()
    }
  },
  watch: {
    // 换歌，第一，播放，第二切歌词，切歌词时候清除上个lyric对象的计时器
    currentSong(newSong, oldSong) {
      // 切模式时候，是不希望改变播放状态的.随机播放当前的index会变得.id没给
      // if(newSong.name === oldSong.name) {
      //   return
      // }
      // 歌曲加载完成之后才能播放。不然没加载好播放肯定报错
      // 如果有当前是有歌的话，有歌词，停掉歌词的计时器
      if(this.currentLyric) {
        this.currentLyric.stop()
      }
      // this.$nextTick(() => {
      //    this.$refs.audio.play()
      //    this.getLyric()
         
      // })
      // 如果歌曲列表没有了，还放个丑嗨.或者用newSong没有来判断。
      if(!this.playlist.length) {
        return
      }
      // 为了防止从后台切过来，歌曲结束时候的问题.不用nextTick了
      // 为了保证快速切歌时候，播放和获得歌词只执行一次。不要去影响playing的状态值（不去触发setPlayingState函数即可）。每次改变时，先去清除延迟器
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
         this.$refs.audio.play()
         this.getLyric()
      },1000)
    },
    // 监视播放状态
    playing(newPlaying) {
      this.$nextTick(() => {
        const audio = this.$refs.audio
        newPlaying ? audio.play() : audio.pause()
      })
    }

   
    
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>