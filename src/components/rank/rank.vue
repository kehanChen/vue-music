<!-- 排行页面 -->
<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" :data="topList" ref="toplist">
      <ul  @touchstart="touchStart"
            @touchmove="touchMove"
            @touchend="touchEnd" ref="toplistUl">
        <li class="item" v-for="item in topList" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl"/>
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song, index) in item.songList">
              <span>{{index + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <!-- 跳转的路由也就toplist出来  -->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import {getTopList} from 'api/rank'
import {ERR_OK} from 'api/config'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
// 播放器出来时候，应该是划不到底部的
import {playlistMixin} from 'common/js/mixin'
import {mapMutations} from 'vuex'
export default {
  mixins: [playlistMixin],
  created() {
      this._getTopList() 
  },
  data() {
    return {
      topList: [],
      touch: {
        startX: 0,
        startY: 0,
        delayX: 0,
        delayY: 0
      }
    }
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
        if(this.touch.delayX > this.$refs.toplistUl.clientWidth*0.2) {
          this.$router.push({
                path: `/singer`
          })
        } else if(this.touch.delayX < -this.$refs.toplistUl.clientWidth*0.2) {
          this.$router.push({
                path: `/search`
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
          this.$refs.rank.style.bottom =  bottom
          this.$refs.toplist.refresh()
      },
      // 页面跳转
      selectItem(item) {
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setTopList(item)
      },
      // 获取数据
      _getTopList() {
        getTopList().then((res) => {
          if(res.code === ERR_OK) {
            // console.log(res.data.topList)
            this.topList = res.data.topList
          }
        })
      },
      ...mapMutations({
        setTopList: 'SET_TOP_LIST'
      })
  },
  components: {
    Scroll,
    Loading
  }
}

 
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>