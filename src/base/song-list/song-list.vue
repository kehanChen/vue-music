<!-- 歌曲列表基础组件，应用于歌手详情页面(music-list组件)，歌单详情页面，排行详情页面里面 -->
<template>
  <div class="song-list">
    <ul>
        <!-- 歌曲列表 -->
        <li @click="selectItem(song,index)" v-for="(song,index) in songs" class="item">
            <!-- 拓展的排序icon，rank里面的歌单需要  -->
            <div class="rank" v-show="rank">
                <span :class="getRankCls(index)">{{getRankText(index)}}</span>
            </div>
            <div class="content">
                <h2 class="name">{{song.name}}</h2>
                <!-- 简介:歌手+专辑，用一个函数处理 -->
                <p class="desc">{{getDesc(song)}}</p>
            </div>
        </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
//需要歌曲数据
export default {
    props: {
        songs: {
            type: Array,
            default: []
        },
        // 通过这个属性判断rank显示不显示
        rank: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        // 只向父组件派发点击事件，发送当前的歌曲的信息以及在列表的索引
        selectItem(song,index) {
            //  console.log(song)
            this.$emit('select', song, index)
        },
        //  简介:歌手+专辑
        getDesc(song) {
            
            return `${song.singer}--${song.album}`
        },
        // rank的歌单详情页的前三的是图标，后面是数字
        getRankCls(index) {
            if(index <= 2) {
                return `icon icon${index}`
            } else {
                return `text`
            }
        },
        getRankText(index) {
            if(index > 2) {
                return index + 1
            }
        }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank 
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
            display: inline-block
            width: 25px
            height: 24px
            background-size: 25px 24px
            &.icon0
                bg-image('first')
            &.icon1
                bg-image('second')
            &.icon2
                bg-image('third')
        .text   
            color: $color-theme
            font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>