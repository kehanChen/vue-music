<!-- 搜索提示框 -->
<template>
    <!-- scrollToEnd是scroll里面派发出来的，开启上啦加载才派发.第一次search时候 ，讲搜索框页面加载到顶部-->
    <scroll  class="suggest" :data="result" 
        :pullup="pullup"
        @scrollToEnd="searchMore"
        ref="suggest"
        :beforeScroll="beforeScroll"
        @beforeScroll="listScroll"
    >
        <ul class="suggest-list" ref="suggestList">
            <!-- 搜索结果被点击的时候，会触发记录searchHistory的动作  -->
            <li @click="selectItem(item)" class="suggest-item" v-for="item in result"> 
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
        <div class="no-result-wrapper" v-show="!hasMore && !result.length">
            <no-result title="抱歉，暂无搜索结果"></no-result>
        </div>
    </scroll>

</template>

 <script type="text/ecmascript-6">
 import {search} from 'api/search'
 import {ERR_OK} from 'api/config'
 const TYPE_SINGER = 'singer'
//一页多少条数据
const PER_PAGE = 20
//处理歌手名字，可能2人的或以上的
import {createSong} from 'common/js/song'
// 可以滑动，上拉加载
import Scroll from 'base/scroll/scroll'
// 上拉刷新
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import {mapMutations, mapActions, mapGetters} from 'vuex'
import NoResult from 'base/no-result/no-result'
import Song from 'common/js/song'
export default {
    
    props: {
        query: {
            type: String,
            default: ''
        },
        showSinger: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            page: 1,
            // 接受请求的数据
            result: [],
            // 是否上啦刷新
            pullup: true,
            // 标志位，是否要再搜索
            hasMore: true,
            // 滚动前失去焦点，给scroll组件用的
            beforeScroll: true
        }
    },
    computed: {
        // getter要写在computed里面
        ...mapGetters(['playHistory'])
    },
    methods: {
        search() {
            // 每一次不同值得请求都是第一个。
            this.page = 1
            this.hasMore = true
            // 第一次请求讲框拉上去.到顶部
            this.$refs.suggest.scrollTo(0, 0)
            // 第一个参数，搜索字，第二个是页数，第三个是是否显示歌手（有的有，有的没.默认有）
            search(this.query, this.page, this.showSinger, PER_PAGE).then((res) => {
                if(res.code === ERR_OK) {
                    this.result = this._genResult(res.data)
                     // 检测有没有多余的
                    this._checkMore(res.data)
                }
            })
        },
        // 处理得到的数据
        _genResult(data) {
            let ret = []
            // 有歌手的
            if(data.zhida && data.zhida.singerid) {
                ret.push({...data.zhida, ...{type: TYPE_SINGER}})
            }
            if(data.song) {
                ret = ret.concat(this._narmalizeSongs(data.song.list))
            }
            return ret
        },
        // 歌曲的歌名需要处理
        _narmalizeSongs(list) {
            let ret =[]
            list.forEach((musicData) => {
                if(musicData.songid && musicData.albumid) {
                    ret.push(createSong(musicData))
                   
                }
            })
            // console.log(list)
            return ret
        },
         // 检测有没有多余的
        _checkMore(data) {
            const song = data.song
            // 20是默认一次发20条的
            if(!song.list.length || (song.curnum+song.curpage*PER_PAGE) > song.totalnum) {
                this.hasMore = false
            }
        },
        // 区分列表每一项的前面的样式.是歌手的话，写歌手，不是的话写音乐图标
        getIconCls(item) {
            if(item.type === TYPE_SINGER) {
                return 'icon-mine'
            } else {
                return 'icon-music'
            }
        },
        // 每一项后面的字。是歌手的话，直接返回歌手名，不是的话:歌手加歌名
        getDisplayName(item) {
            if(item.type === TYPE_SINGER) {
                return item.singername
            } else {
                // 歌手。。如果是俩人或以上的，需要处理下
                return `${item.name}-${item.singer}`
            }
        },
        // 搜索更多.快到底时候会被调用
        searchMore() {
            // 检测是否有更多.没有返回，有的话继续加载数据，页数加以
            if(!this.hasMore) {
                return
            }
            // 有的话继续请求，然后和上面的数据加起来
            this.page++
            search(this.query, this.page, this.showSinger, PER_PAGE).then((res) => {
                if(res.code === ERR_OK) {
                    this.result = this.result.concat(this._genResult(res.data))
                     // 检测有没有多余的
                    this._checkMore(res.data)
                }
            })
        },
        // 开子路由
        selectItem(item) {
            if(item.type === TYPE_SINGER) {
            //  先构造歌手对象
            const singer = new Singer({
                id: item.singermid,
                name: item.singername
            })
            this.$router.push({
                path: `/search/${singer.id}`
            })
            // console.log(singer)
            this.setSinger(singer)
            } else {
                // console.log(item)
                // else逻辑可能有错。todo
                // 先设置，再读取最近播放数据
               
                this.savePlayHistory(item)
                // console.log(this.playHistory)
                let list = this.playHistory.map((song) => {
                    return  new Song(song)
                })
                // console.log(list)
                this.selectPlay({
                    // 歌曲列表,是一个数组，需要拿到后面去处理。后面播放器需要歌曲列表。应该放在最近播放列表里面。可以去localhost里面去取。也一定是去那里取。getter在computed里面
                    list: list,
                    index: 0
                })
            }
            this.$emit('select')
        },
        // 这个是点歌手的。调出来歌手详情页面
        ...mapMutations({
            setSinger: 'SET_SINGER'
        }),
        //
        //  这个是直接点搜索的歌曲的。应该加在最近播放的列表表。第一次肯定就一个。直接调播放器。
        ...mapActions([
            'selectPlay',
            'savePlayHistory'
        ]),
        // 列表有滚动的话，给外面传事件，让输入框失去焦点
        listScroll() {
            this.$emit('listScroll')
        },
        refresh() {
            this.$refs.suggest.refresh()
        }
       
    },
    // 传进来的数据区请求后端。监视这个值得变化
    watch: {
        query() {
            this.search()
        }
    },
    components: {
        Scroll,
        Loading,
        NoResult
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>