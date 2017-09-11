<template>
  <div id="app">
    <!-- 头部  -->
    <m-header></m-header>
    <!-- 推荐歌手排行搜索的选项卡 -->
    <tab></tab>
    <!--包数据缓存在内存里面，不用每次都重新调用jsonp去请求  -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!-- 播放器  -->
    <player></player>
  </div>
</template>

 <script type="text/ecmascript-6">
 //注册MHeader.先引入再注册
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  import Player from 'components/player/player'
  // 注册
  export default {
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "./common/stylus/variable"

  #app 
    color: $color-theme
</style>
