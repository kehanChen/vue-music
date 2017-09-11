<!-- 用户中心,路由组件 -->
<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
          <switches :switches="switches" :currentIndex="currentIndexPage"
           @switch="switchItem"></switches>
      </div>
      <div ref="playBtn" class="play-btn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndexPage===0" :data="songs">
            <div class="list-inner">
                <song-list :songs="songs" @select="selectSong"></song-list>
            </div>
        </scroll>
        <scroll ref="playlist" class="list-scroll" v-if="currentIndexPage===1" :data="songs">
            <div class="list-inner">
                <song-list :songs="songs"></song-list>
            </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-if="noResult">
           <no-result :title="noResultTitle"></no-result> 
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import Switches from 'base/switches/switches'
import {mapGetters, mapActions, mapMutations} from 'vuex'
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import NoResult from 'base/no-result/no-result'
import Song from 'common/js/song'
import {playMode} from 'common/js/config'
// 小播放器出来自动重新算高度
import {playlistMixin} from 'common/js/mixin'
export default {
    mixins: [playlistMixin],
    data() {
        return {
            currentIndexPage: 0,
            switches: [
                {name: '我喜欢的'},
                {name: '最近听的'}
            ],
            songs: []
        }
    },
    // 将songs初始化
    mounted() {
        this.songs = this.favoriteList.map((song) => {
            return new Song(song)
        })
    },
    computed: {
        ...mapGetters([
            'favoriteList',
            'playHistory'
        ]),
        // 没有结果的时候。有个背景图.这俩都是算出来的
        noResult() {
            if(this.currentIndexPage === 0) {
                return !this.favoriteList.length
            }
            if(this.currentIndexPage === 1) {
                return !this.playHistory.length
            }
        },
        noResultTitle() {
            if(this.currentIndexPage === 0) {
                return '暂无收藏歌曲'
            }
            if(this.currentIndexPage === 1) {
                return '您还没有听过音乐'
            }
        }
    },
    methods: {
        
        handlePlaylist(playlist) {
            const bottom = playlist.length>0 ? '60px' : ''
            this.$refs.listWrapper.style.bottom = bottom
            this.$refs.favoriteList &&  this.$refs.favoriteList.refresh()
            this.$refs.playlist &&  this.$refs.playlist.refresh()
        },
        // 回退到上一级
        back() {
            this.$router.back()
            setTimeout(() => {
                this.currentIndexPage = 0
            },500)
           
        },
        //监听子组件的 
        switchItem(index) {
            // 将拿到的数据处理一下
            this.songs = []
            if(index===1) {
                this.songs = this.playHistory.map((song) => {
                    return new Song(song)
                })
            }
            if(index===0) {
                this.songs = this.favoriteList.map((song) => {
                    return new Song(song)
                })
            }
            this.currentIndexPage = index
        },
        selectSong(item, index) {
            this.selectPlay({
                // 歌曲列表，需要拿到后面去处理。后面播放器需要歌曲列表
                list: this.songs,
                index: index
            })
        },
        ...mapActions([
            'selectPlay'
        ]),
        ...mapMutations({
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE'
        }),
        // 随机播放
        random() {
            // 如果没有歌曲列表，什么都不做
            if(!this.songs.length) {
                return
            }
            let index = Math.floor(Math.random()*this.songs.length)
            this.selectPlay({
                // 歌曲列表，需要拿到后面去处理。后面播放器需要歌曲列表
                list: this.songs,
                index: index
            })
            this.setPlayMode(playMode.random)
        }

    },
    watch: {
        favoriteList() {
            this.songs = this.favoriteList.map((song) => {
                return new Song(song)
            })
        }
    },
    components: {
        Switches,
        Scroll,
        SongList,
        NoResult
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
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
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
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
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>