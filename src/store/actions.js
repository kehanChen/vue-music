// 选择播放动作。commit方法(打开，播放方式：顺序？循环？,全屏？)，state属性 list歌曲列表，index当前歌曲的在列的位置

import * as types from './mutation-types'
// 暴露调用音乐播放器方法。要调的话直接调就行了。第二个参数配好就行了
export const selectPlay = function({commit, state},{list,index}) {
    commit(types.SET_SEQUENCE_LIST, list) 
    commit(types.SET_PLAYLIST, list)
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'
// 将历史搜索记录和最近播放的歌曲记录下来.search里面调用
export const saveSearchHistory = function({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除一条历史记录
export const deleteSearchHistory = function({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 删除全部历史记录.直接传一个空数组
export const clearSearchHistory = function({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 删除当前列表的一个。主要的是在喜欢里面的用。播放器列表里面的个也要用
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.mid === song.mid
  })
}

export const deleteSong = function({commit,state}, song) {
   let playlist = state.playlist.slice()
   let sequenceList = state.sequenceList.slice()
   let currentIndex = state.currentIndex
   let pIndex = findIndex(playlist, song)
   playlist.splice(pIndex, 1)
   let sIndex = findIndex(sequenceList, song)
   sequenceList.splice(sIndex, 1)

// 如果删除的是最后一首歌,或者是当前歌曲在删除歌曲之后.那么currentIndex要--才能对应上。
    if(currentIndex > pIndex || currentIndex === playlist.length) {
        currentIndex--
    }
    commit(types.SET_SEQUENCE_LIST, sequenceList) 
    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    // 如果删完了，将播放状态置为false
    if(!playlist.length) {
         commit(types.SET_PLAYING_STATE, false)
    } else {
         commit(types.SET_PLAYING_STATE, true)
    }
}
// 删除播放列表的全部歌曲.就是还原下状态
export const deleteSongList = function ({commit}) {
    commit(types.SET_SEQUENCE_LIST, []) 
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
}

// 存放最近的播放记录.取出来要重新用song构造一下，不然没有getLyric
export const savePlayHistory = function ({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}

// 关于我喜欢的数据操作.取出来要重新用song构造一下，不然没有getLyric
export const saveFavoriteList = function({commit}, song) {
   commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}
// 删除为喜欢的数据操作
export const deleteFavoriteList = function({commit}, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}