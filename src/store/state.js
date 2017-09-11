// 相关的原始数据
// 歌曲播放模式，从配置文件里面拿
import {playMode} from 'common/js/config'
// 得到本地数据__search__的引入
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'
const state = {
  singer: {},
  // 是否播放
  playing: false,
  // 是否全屏
  fullScreen: false,
  // 歌曲列表。上一首下一首等等
  playlist: [],
  // 顺序列表。顺序播放时候一样，随机可能要打乱
  sequenceList: [],
  // 模式.默认顺序
  mode: playMode.sequence,
  // 当前播放歌曲
  currentIndex: -1,
  // 推荐的歌单详情
  disc: {},
  // 排行的歌单详情
  topList: {},
  // 搜索历史
  searchHistory: loadSearch(),
  // 最近播放
  playHistory: loadPlay(),
  // 我喜欢的
  favoriteList: loadFavorite()
}

export default state