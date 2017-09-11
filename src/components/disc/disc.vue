<!--推荐页面的歌单详情页面，与歌手的歌曲详情页面差不多singer-detail，也用到了music-list组件。用到了二级路由-->
<template>
    <!-- 添加入场出场动画 -->
    <transition name="slide">
        <music-list :title="title" :bg-image="baImage" :songs="songs"></music-list>
    </transition>
</template>

 <script type="text/ecmascript-6">
//  引用组件一定要注册！！！！！
import MusicList from "components/music-list/music-list"
// 用于接收上面传进来的数据
import {mapGetters} from 'vuex'
// 引入请求信息的函数JSONP
import {getSongList} from 'api/recommend'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
export default {
    computed: {
        title() {
            // console.log(this.disc,111)
            return this.disc.dissname
        },
        baImage() {
            return this.disc.imgurl
        },
        // 接收上面传进来的disc
        ...mapGetters([
            'disc'
        ])
    },
    data() {
        return {
            songs: []
        }
    },
    created() {
        this._getSongList()
    },
    methods: {
        _getSongList() {
            // 防止在歌单详情页面刷新，拿不到数据，那就直接返回上一层
            if(!this.disc.dissid) {
                // 回到父级路由
                this.$router.push('/recommend')
                return
            }
            getSongList(this.disc.dissid).then((res) => {
                if(res.code === ERR_OK) {
                    // console.log(res.cdlist[0].songlist)
                    this.songs = this._normalizeSongs(res.cdlist[0].songlist)
                }
            })
        },
        _normalizeSongs(list) {
            let ret= []
            list.forEach((musicData) => {
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
@import "~common/stylus/variable"

.slide-enter-active,.slide-leave-active
    transition: all 0.6s
.slide-enter,.slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>