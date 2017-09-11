<!-- 歌单详情页面,利用子路由(singer里面的router-view)。业务组件之一 -->
<template>
    <!-- 添加入场出场动画 -->
    <transition name="slide">
        <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
    </transition>
</template>

 <script type="text/ecmascript-6">
//  vuex 的语法糖
import {mapGetters} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'
import MusicList from "components/music-list/music-list"
// 调用需要的song的信息的构造函数
import {createSong} from 'common/js/song'
export default {
    data() {
        // 歌手详情的信息.只需要部分的信息就可以了
        return {
            songs: []
        }
    },
    computed: {
        title() {
            // console.log(this.singer)
            return this.singer.name
        },
        bgImage() {
            return this.singer.avatar
        },
        // 代理,this.singer就能直接用了，调用vuex里面的singer（store里面）
        ...mapGetters(['singer'])
    },
    created() {
        this._getDetail()
        // console.log(this.singer)
    },
    methods: {
        _getDetail() {
            // 直接从子路由进去是没有的。为了防止不小心刷新，还需要有数据。或者返回上一层，这里是返回上一层
            if(!this.singer.id) {
                this.$router.push('/singer')
                return
            }
            // 抓取数据
            getSingerDetail(this.singer.id).then((res) => {
                if(res.code === ERR_OK) {
                    // 歌手详情信息
                    // console.log(res.data.list)
                    this.songs = this._normalizeSongs(res.data.list)
                    // console.log(this.songs)
                }
            })
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                // 解构赋值.只要item。musicData里面的一些信息
                let {musicData} = item
                // 歌曲id和图片信息是必须要的
                if(musicData.songid && musicData.albummid) {
                    // console.log(musicData)
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