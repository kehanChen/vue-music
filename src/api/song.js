// 请求歌词
import {commonParams} from './config'
import axios from 'axios'
// 请求歌词，后端代理
export function getLyric(mid) {
    // console.log(mid)
    const url = '/api/lyric'

    const data = Object.assign({},commonParams,{
        songmid: mid,
        pcachetime: +new Date(),
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}