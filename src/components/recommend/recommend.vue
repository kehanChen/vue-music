<!-- 推荐及歌单页面 -->
<template>
  <div class="recommend" ref="recommend">
    <!--数据得到了再加载，不然每数据里面全空，滚的也是空，自然滚不动，所以等discList（默认在recommended之后）到位了再启用这个组件的mounted  -->
    <scroll ref="scroll" class="recommend-content" :data="num">
      <!--再包一层，这个一层是一起滚动的.包括轮播图  -->
      <div>
        <div  v-if="recommends.length" class="slider-wrapper">
          <!--确定得到数据了再计算宽度  -->
          <slider ref="slider">
            <div  v-for="item in recommends">
              <a :href="item.linkUrl">
                <!-- class="needsclick"，fastclick自带的，解决fastclick个better-srcoll点击冲突问题  -->
                <img class="needsclick" @load="loadImage" :src="item.picUrl"/>
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list" ref="recommendList"
           @touchstart="touchStart"
           @touchmove="touchMove"
           @touchend="touchEnd"
        >
          <h1 class="list-title">热门歌单推荐</h1>
          <ul> 
            <li v-for="item in discList" class="item" @click="selectItem(item)">
              <div class="icon">
              <img v-lazy="item.imgurl" width="60" height="60"/>
              </div>
              <div class="text">
                <!-- <h2 class="name" v-html="item.creator.name"></h2> -->
                 <h2 class="name" v-html="item.author"></h2> 
                
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div> 
    </scroll>
    <!-- 添加子路由，用于本页面的歌单详情页面 -->
    <router-view></router-view>
  </div>
</template>

 <script type="text/ecmascript-6">
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'
  export default {
    mixins: [playlistMixin],
    data() {
      return {
        recommends: [],
        discList: [],
        num: [],
        touch: {
          startX: 0,
          startY: 0,
          delayX: 0,
          delayY: 0
        }
      }
    },
    created() {
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      touchStart(e) {
        let touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      touchMove(e) {
        let touch = e.touches[0]
        this.touch.delayX = touch.pageX - this.touch.startX
        this.touch.delayY = touch.pageY - this.touch.startY
      },
      touchEnd(e) {
        if(Math.abs(this.touch.delayX) > Math.abs(this.touch.delayY)) {
          if(this.touch.delayX > this.$refs.recommendList.clientWidth*0.2) {
            this.$router.push({
                  path: `/search`
            })
          } else if(this.touch.delayX < -this.$refs.recommendList.clientWidth*0.2) {
            this.$router.push({
                  path: `/singer`
            })
          }
          // 重置
          this.touch.delayX = 0
          this.touch.delayY = 0
        }
      },
       // 重置playlist的定位底部
      handlePlaylist(playlist) {
          const bottom = playlist.length > 0 ? '60px' : ''
          this.$refs.recommend.style.bottom =  bottom
          this.$refs.scroll.refresh()
      },
      // 给歌单详情页面传入数据.通过路由传id（路径）跳转
      selectItem(item) {
        // console.log(item)
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        // 修改了state，传入需要的部分，下面接收的就是这个了
        this.setDisc(item)
      },
      _getRecommend() {
        getRecommend().then((res) => {
          if(res.code == ERR_OK) {
            // console.log(res.data.slider)
            this.recommends = res.data.slider
            this.num.length++
            // console.log(this.num)
            setTimeout(() => {
              // console.dir(this.$refs.scroll.$el)
              this.$refs.scroll.refresh()
            },200)
          }
        })
      },
      _getDiscList() {
        getDiscList().then((res) => {
          if(res.code == ERR_OK) {
            // console.log(res.data.list)
            // this.discList = res.data.list
            this.discList = res.data.hotdiss.list.slice(1)
            // console.log(this.discList)            
            this.num.length++
            // console.log(this.num)
          }
        })
      },
      // 轮播图是有高度撑开的，应该在一张图片加载完毕之后重新刷新计算总体竖屏滚动DIV的高度即scroll
      loadImage() {
        setTimeout(() => {
          // 只要一次成开就行，不然浪费性能
          if(!this.checkLoaded) {
            this.$refs.scroll.refresh()
            this.checkLoaded = true
          }
        },200)
      },
      // 给下面传数据
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    },
    
    // 注册组件
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
