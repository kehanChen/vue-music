<!-- 排行页面的歌单详情页面，大部分和歌手详情页面，推荐歌单详情页面差不多（music-list）.是rank的子路由 -->
<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getMusicList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  export default {
    computed: {
        title() {
            return this.topList.topTitle
        },
        bgImage() {
            // 图片换一张，太暗了
            if(this.songs.length) {
                 return this.songs[0].image
            }
            return this.topList.picUrl
        },
        // 外面传进来的topList。通过vuex传的
        ...mapGetters([
            'topList'
        ])
    },
    created() {
        this._getMusicList()
    },
    data() {
        return {
            songs: [],
            rank: true
        }
    },
    methods: {
        _getMusicList() {
            // 就是没有这个数据.this.topList是一个对象，没有长度，不要用长度做条件
            if(!this.topList.id) {
                // 跳转路由。跳到父路由直接字符串，跳到子路由加path。还要通过mapMutations这个语法糖传给子路由页面数据
                this.$router.push('/rank')
                return
            }
            getMusicList(this.topList.id).then((res) => {
                if(res.code === ERR_OK) {
                    // console.log(res.songlist)
                    this.songs = this._normallizeSongs(res.songlist)
                }   
            }) 
        },
        // 处理数据的
        _normallizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                const musicData = item.data
                if(musicData.songid && musicData.albumid) {
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>