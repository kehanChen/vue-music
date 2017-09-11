// jsonp请求
import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'
// 推荐请求(轮播图)
export function getRecommend() {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

    const data = Object.assign({},commonParams,{
        platform: 'h5',
        uin: 0,
        needNewCode: 1
    })

    return jsonp(url, data, options)
}
// 歌单请求。后端代理的
export function getDiscList(dissid) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_first_yqq.fcg'
    const data = Object.assign({},commonParams,{
        disstid: dissid,
        type: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 1,
        page: 'other',
        tpl: 'v12',
        outCharset: 'GB2312'
    })
    return jsonp(url, data, options)
}
// export function getDiscList() {
//     const url = '/api/getDiscList'
//     // const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
//     const data = Object.assign({},commonParams,{
//         platform: 'yqq',
//         hostUin: 0,
//         sin: 0,
//         ein: 29,
//         sortId: 5,
//         needNewCode:0,
//         categoryId: 10000000,
//         rnd: Math.random(),
//         format: 'json'
//     })
//     return axios.get(url, {
//         params: data
//     }).then((res) => {
//         return Promise.resolve(res.data)
//     })
// }
// 获取歌单的歌曲列表
export function getSongList(dissid) {
    const url = '/api/getSongList'
    // https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=2680129113&format=jsonp&g_tk=5381&jsonpCallback=playlistinfoCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0
    const data = Object.assign({},commonParams,{
       disstid: dissid,
        type: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 1,
        format: 'json'
    })

    // return jsonp(url, data, options)
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}