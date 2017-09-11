<!-- 播放列表组件 -->
<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{textMode}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll ref="listContent" :data="sequenceList" class="list-content">
          <transition-group name="list" tag="ul">
            <li  ref="listItem" class="item" 
            v-for="(item,index) in sequenceList" 
             @click="selectItem(item,index)"
             :key="item.mid">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <!-- <div class="list-operate">
          <div class="add">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div> -->
        <div  class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空播放列表" @confirm="confirmClear"></confirm>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations, mapActions} from 'vuex'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
// 播放模式的引入
import {playMode} from 'common/js/config'
//添加喜欢/删除操作，和播放器的共享
import {playerMixin} from 'common/js/mixin'
export default {
    mixins: [playerMixin],
    data() {
        return {
            showFlag: false
        }
    },
    computed: {
        ...mapGetters([
            'sequenceList',
            // 要得到当前的歌曲，正在播放的歌曲的样式和其他的是不同的
            'currentSong',
            'playlist',
            'mode'
        ]),
         // 播放模式图标的改变
        iconMode() {
          return this.mode === playMode.sequence ? 'icon-sequence' : (this.mode === playMode.loop ? 'icon-loop' : 'icon-random' )
        },
        textMode() {
           return this.mode === playMode.sequence ? '顺序播放' : (this.mode === playMode.loop ? '单曲循环' : '随机播放' )
        }
    },
    methods: {
        show() {
            this.showFlag = true
            // 一开始就有，只是隐藏了，显示时候要重新刷新计算高度。
            setTimeout(() => {
                this.$refs.listContent.refresh()
                // 显示时候要滚到对应位置
                this.scrollTocurrent(this.currentSong)
            },20)
        },
        hide() {
            this.showFlag = false
            // console.log(this.currentSong)
        },
        getCurrentIcon(item) {
            return item.mid === this.currentSong.mid ? 'icon-play' : ''
        },
        // 切歌
        selectItem(item, index) {
            this.setCurrentIndex(index)
            this.setPlayingState(true)
        },
        ...mapMutations({
            'setCurrentIndex': 'SET_CURRENT_INDEX',
            'setPlayingState': 'SET_PLAYING_STATE',
            setPlayMode: 'SET_PLAY_MODE',
        }),
        ...mapActions([
            'deleteSong',
            'deleteSongList'
        ]),
        // 播放列表滚动到当前的歌曲.切换成功时候滚动
        scrollTocurrent(current) {
            const index = this.sequenceList.findIndex((song) => {
                return current.mid === song.mid
            })
            this.$refs.listContent.scrollToElement(this.$refs.listItem[index],300)
        },
        // 列表里面删除一个
        deleteOne(item) {
            this.deleteSong(item)
            // 如果列表长度删的剩零了。还是隐藏，省的到时候一下出来
            if(!this.playlist.length) {
              this.hide()
            }
        },
        showConfirm() {
          this.$refs.confirm.show()
        },
        // 按下提示框确定删除全部
        confirmClear() {
          this.deleteSongList()
          // 歌删完； 肯定要隐藏
          this.hide()
        },
         // 改变播放模式.先改图标，最关键的是修改列表
        changeMode() {
          const mode = (this.mode + 1) % 3
          this.setPlayMode(mode)
        }

    },
    watch: {
        currentSong(newSong, oldSong) {
            if(!this.showFlag || newSong.mid === oldSong.mid) {
                return
            }
            this.scrollTocurrent(newSong)
        }
    },
    components: {
        Scroll,
        Confirm
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>