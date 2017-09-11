// 排行页面的歌单数据请求
import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
// 排行页面的歌单数据请求
export function getTopList() {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'
    
   const data = Object.assign({},commonParams,{
        platform: 'h5',
        needNewCode: 1
    })
    // return axios.get(url, {
    //     params: data
    // }).then((res) => {
    //     return Promise.resolve(res.data)
    // })
    return jsonp(url, data, options)
}
// 排行页面的歌单详情数据请求.json请求，也支持jsonp格式
export function getMusicList(topid) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
    
   const data = Object.assign({},commonParams,{
        page: 'detail',
        type: 'top',
        tpl: 3,
        platform: 'h5',
        needNewCode: 1,
        topid: topid
    })
    return jsonp(url, data, options)
}