import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'
// 歌手详情页列表的歌曲的抽象.构造一个类出来
export default class Song {
    // 需要id，mid，歌手，歌名，专辑，总时长，个图图片，歌曲请求真实路径.构造一个类出来
    constructor({id,mid,singer,name,album,duration,image,url}) {
        this.id = id,
        this.mid = mid,
        this.singer = singer,
        this.name = name,
        this.album = album,
        this.duration = duration,
        this.image = image,
        this.url = url
    }
    // 歌词
    getLyric() {
        if(this.lyric) {
            return Promise.resolve(this.lyric)
        }
        return new Promise((resolve, reject) => {
             getLyric(this.mid,this.id).then((res) => {
                if(res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric)
                    // console.log(this.lyric)
                    resolve(this.lyric)
                } else {
                    reject('no lyric')
                }
            })
        })
       
    }

}
// 歌手,歌单详情转成我们自己需要的格式
export function createSong(musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        // 通过多个地址拼接的
        url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=38`
    })
}
// 如果歌手是2个人话，名字用/分开
function filterSinger(singer) {
    if(typeof singer === 'string') {
        return singer
    }
    let ret = []
    if(!singer) {
        return ''
    }
    singer.forEach((item) => {
        ret.push(item.name)
    })
    return ret.join('/')
}
