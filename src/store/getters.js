// 去取基础数据
// 歌手详情页面
export const singer = state => state.singer

// 播放器界面
export const playing = state => state.playing
export const fullScreen = state => state.fullScreen
export const playlist = state => state.playlist
export const sequenceList = state => state.sequenceList
export const mode = state => state.mode
export const currentIndex = state => state.currentIndex
// 通过当前播放歌曲的索引去取到当前歌曲
export const currentSong = (state) => {
    return state.playlist[state.currentIndex] || {}
}
export const disc = state => state.disc
export const topList = state => state.topList
export const searchHistory = state => state.searchHistory
// 歌曲ready时候写入播放历史
export const playHistory = state => state.playHistory
// 我喜欢的记录
export const favoriteList = state => state.favoriteList