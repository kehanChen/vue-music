// 处理播放器最小化时候Scroll底部不能滚上迷你播放器问题。重新计算高度.推荐recommend，歌手列表singer，歌手的歌曲列表music-list，都有用到
import {mapGetters, mapMutations, mapActions} from 'vuex'
export const playlistMixin = {
    computed: {
        // 得到播放列表
        ...mapGetters([
            'playlist'
        ])
    },
    // dom ready时候触发
    mounted() {
        this.handlePlaylist(this.playlist)
    },
    // keep-alive组件切换时候触发
    activated() {
        this.handlePlaylist(this.playlist)
    },
    // 监视playlist
    watch: {
        playlist(newVal) {
            this.handlePlaylist(newVal)
        }
    },
    methods: {
        // 处理playlist.默认的，歌曲列表刷新时候需要自己去定义handlePlaylist。不然提醒一下
        handlePlaylist() {
            throw new Error('component must implement handlePlaylist method')
        }
    }
}

// 添加/删除我喜欢的
export const playerMixin = {
  computed: {
    ...mapGetters([
      'sequenceList',
      'playlist',
      'currentSong',
      'favoriteList'
    ])
  },
  methods: {
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.mid === song.mid
      })
      return index > -1
    },
    ...mapMutations({
      setPlaylist: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}
