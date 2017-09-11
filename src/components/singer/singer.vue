<!-- 歌手页面 -->
<template>
  <div class="singer" ref="singer">
      <div class="singerWrap" ref="singerWrap" 
         @touchstart="touchStart"
         @touchmove="touchMove"
         @touchend="touchEnd"
      >
        <!--这里能监听到组件里面的事件的  -->
        <list-view @select="selectSinger" :data="singers" ref="singerList"></list-view>
      </div>
      <!--承载子路由-->
      <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'
  // vuex..mapMutations语法糖
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'
  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10

  export default {
    // 本组件同名handlePlaylist方法会覆盖playlistMixin里面的handlePlaylist.必须重置，不然会报错（自己设置的报错）
    mixins: [playlistMixin],
    // 这个函数返回值是一个对象，不能不写ruturn
    data() {
      return {
        singers: [],
        touch: {
          startX: 0,
          startY: 0,
          delayX: 0,
          delayY: 0
        }
      } 
    },
    created() {
      this._getSingerList()
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
          if(this.touch.delayX > this.$refs.singerWrap.clientWidth*0.2) {
            this.$router.push({
                  path: `/recommend`
            })
          } else if(this.touch.delayX < -this.$refs.singerWrap.clientWidth*0.2) {
            this.$router.push({
                  path: `/rank`
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
          this.$refs.singerWrap.style.bottom =  bottom
          this.$refs.singerList.refresh()
      },
      // 这里的singer其实就是listview里面的click事件派发出来的item
      selectSinger(singer) {
        // console.log(singer)
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        // 修改了state.传入需要的部分，下面接收的就是这个了
        this.setSinger(singer)
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if(res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
            // console.log(this.singers)
          }
        })
      },
      // 处理this.singers数据，原来的不是我们想要的，对它的Findex进行一下分类规划。（歌手姓的开头字母）
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // 0-10条数据放在热门里面
        list.forEach((item, index) => {
          if(index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }
          // 歌手名字的划分
          const key = item.Findex
          if(!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
          }))
        })
        // console.log(map)
        // 按热门和ABCD分成各个对象了
        // 为了得到有序列表，需要处理map
        let hot = []
        let ret = []
        for(let key in map) {
          let val = map[key]
          // 如果是A-Z开头的话，找出来
          if(val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if(val.title == HOT_NAME) {
            hot.push(val)
          } 
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      // 拓展运算符，做对象映射.把mutation对象映射成一个方法名.
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      ListView
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer 
    
  .singerWrap
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>