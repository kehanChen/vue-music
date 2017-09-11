// 主要用来操作localstorage相关的逻辑
import storage from 'good-storage'
// 最大缓存15条数据
const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 80

const FAVORITE_KEY ='__favorite__'
const FAVORITE_MAX_LENGTH = 80
// 把插入内容先去重，再插到最前面.在actions里面操作
// 参数： arr传入的数组， val插入的值， compare比较函数(给findindex用的，基本上就是拿来去重的)， maxLen最大长度
function insertArray(arr, val, compare, maxLen) {
    const index = arr.findIndex(compare)
    // 有重复的，且是第一个，那么上面不用做。也可以和下面合并
    if(index === 0) {
        return
    }
    // 有重复的
    if(index > 0) {
        arr.splice(index, 1)
    }
    // 插入进去。有的删掉，没有的就放第一个
    arr.unshift(val)
    // 如果限制了长度。且大于长度，把最后一个删掉
    if(maxLen && arr.length > maxLen) {
        arr.pop()
    }
}
// 存储搜索结果
export function saveSearch(query) {
    // key值SEARCH_KEY，value默认空数组
    let searches = storage.get(SEARCH_KEY, [])
    insertArray(searches, query, (item) => {
        return item === query
    }, SEARCH_MAX_LENGTH)
    storage.set(SEARCH_KEY, searches)
    return searches
}
//从本地缓存拿到数据，不然历史记录每次默认值是空数组[]是不对的。在state里面读。初始化
 export function loadSearch() {
    //  得到key为SEARCH_KEY的本地存储的对象。如果没有，默认是[]
     return storage.get(SEARCH_KEY, [])
 }
// 删除数组里面一个.找到直接删除
function deleteArray(arr, compare) {
    const index = arr.findIndex(compare)
    if(index > -1) {
        arr.splice(index, 1)
    }
}
// 删除指定的存储结果
export function deleteSearch(query) {
    // key值SEARCH_KEY，value默认空数组
    let searches = storage.get(SEARCH_KEY, [])
    deleteArray(searches, (item) => {
        return item === query
    })
    // 保存数据
    storage.set(SEARCH_KEY, searches)
    return searches
}
// 删除全部的结果
export function clearSearch() {
    storage.remove(SEARCH_KEY)
    return []
}

// 存储最近播放的歌曲
export function savePlay(song) {
    // key值SEARCH_KEY，value默认空数组
    let songs = storage.get(PLAY_KEY, [])
    insertArray(songs, song, (item) => {
        return item.mid === song.mid
    }, PLAY_MAX_LENGTH)
    storage.set(PLAY_KEY, songs)
    return songs
}
// 读取最近播放歌曲的数据
export function loadPlay() {
    //  将本地存储的拿出来转成送类。不然转成JSONP原型链上面的东西没了
    return storage.get(PLAY_KEY, [])
}

// 我喜欢的数据操作
export function saveFavorite(song) {
    let favoriteSongs = storage.get(FAVORITE_KEY, [])
    insertArray(favoriteSongs, song, (item) => {
        return item.mid === song.mid
    }, FAVORITE_MAX_LENGTH)
    storage.set(FAVORITE_KEY, favoriteSongs)
    return favoriteSongs
}
export function deleteFavorite(song) {
    let favoriteSongs = storage.get(FAVORITE_KEY, [])
    deleteArray(favoriteSongs, (item) => {
        return item.mid === song.mid
    })
    // 保存数据
    storage.set(FAVORITE_KEY, favoriteSongs)
    return favoriteSongs
}

export function loadFavorite(song) {
    return storage.get(FAVORITE_KEY, [])
}