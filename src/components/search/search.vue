<!-- 搜索页面 -->
<template>
  <div class="search" ref="search">
      <div class="search-wrap" ref="searchWrap"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      >
        <div class="search-box-wrapper">
          <search-box ref="searchBox" @query="onQueryChange"></search-box>
        </div>
        <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
          <scroll  class="shortcut" ref="shortcut" :data="shortcut">
            <div>
              <div class="hot-key">
                <h1 class="title">热门搜索</h1>
                <ul>
                  <li class="item" v-for="item in hotKey" @click="addQuery(item.k)">
                    <span>{{item.k}}</span>
                  </li>
                </ul>
              </div>
              <div class="search-history" v-show="searchHistory.length">
                <h1 class="title">
                  <span class="text">搜索历史</span>
                  <span class="clear" @click="showConfirm">
                    <i class="icon-clear"></i>
                  </span>
                </h1>
                <search-list :searches="searchHistory"
                  @select="addQuery" @delete="deleteOne"
                ></search-list>
              </div>
            </div>
          </scroll>
        </div>
        <div class="search-result" v-show="query" ref="searchResult">
          <!-- select搜索框点击内容时派发出来的时间.这个时候保存历史记录  -->
          <suggest :query="query" @listScroll="blurInput" ref="suggest" @select="saveSearch"></suggest>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空所有搜索历史" @confirm="deleteAll"></confirm>
      <!-- 配的二级路由  -->
      <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box'
// 请求热门搜索
import {getHotKey} from 'api/search'
import {ERR_OK} from 'api/config'
// 搜索框组件
import Suggest from 'components/suggest/suggest'
import {playlistMixin} from 'common/js/mixin'
// 操作历史记录的
import {mapActions, mapGetters} from 'vuex'
// 历史搜索记录的组件searchlist
import SearchList from 'base/search-list/search-list'
// 弹窗组件
import Confirm from 'base/confirm/confirm'
// 引入滚动组件。包在历史记录外面
import Scroll from 'base/scroll/scroll'
export default {
   mixins: [playlistMixin],
  created() {
    this._getHotKey()
  },
  data() {
    return {
      hotKey: [],
      query: '',
      touch: {
        startX: 0,
        startY: 0,
        delayX: 0,
        delayY: 0
      }
    }
  },
  computed: {
    //因为热门搜索和最近搜索在一起的。把他俩数据合并起来,只要有一个改变，总数据改变，就重新计算了
    shortcut() {
      return this.hotKey.concat(this.searchHistory)
    },
    // 需要获得历史的搜索数据的列表。用来做搜索历史记录列表
    ...mapGetters(['searchHistory'])
  },
  methods: {
    // 重置playlist的定位底部
    handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        
        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()

        this.$refs.searchResult.style.bottom =  bottom
        this.$refs.suggest.refresh()
        // console.log(this.$refs.suggest)
    },
    // 失去焦点
    blurInput() {
      this.$refs.searchBox.blur()
    },
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
        if(this.touch.delayX > this.$refs.searchWrap.clientWidth*0.2) {
          this.$router.push({
                path: `/rank`
          })
        } else if(this.touch.delayX < -this.$refs.searchWrap.clientWidth*0.2) {
          this.$router.push({
                path: `/recommend`
          })
        }
        // 重置
        this.touch.delayX = 0
        this.touch.delayY = 0
        // 调用子组件的方法
        // this.$refs.searchBox.setQuery('')
      }
    },
    addQuery(query) {
      // 调用子组件的方法
      this.$refs.searchBox.setQuery(query)
    },
    _getHotKey() {
      getHotKey().then((res) => {
        if(res.code === ERR_OK) {
          // console.log(res.data.hotkey)
          this.hotKey = res.data.hotkey.slice(0,10)
          // console.log(this.hotKey)
        }
      })
    },
    // 搜索条的内容出来，然后要传给搜索框组件
    onQueryChange(query) {
      this.query = query
    },
    // 保存搜索结果
    saveSearch() {
      // 搜索框出来之后点了才加进去
      this.saveSearchHistory(this.query)
    },
    // 删一条数据
    deleteOne(item) {
      this.deleteSearchHistory(item)
    },
    // 删全部数据
    deleteAll() {
      this.clearSearchHistory()
    },
    // 删除数据时候提示框出来确认与否
    showConfirm() {
      this.$refs.confirm.show()
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory'
    ])
  },
  watch: {
    query(newQuery) {
      if(!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        },20)
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>