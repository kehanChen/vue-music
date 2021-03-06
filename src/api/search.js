// 搜索相关接口
import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

// 热门推荐搜索请求
export function getHotKey() {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        needNewCode: 1
    })

    return jsonp(url, data, options)
}
// 搜索框数据请求
export function search(query, page, zhida, perpage) {
    const url = "https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp"

    const data = Object.assign({}, commonParams, {
        w: query,
        p: page,
        catZhida: zhida ? 1 : 0,
        zhidaqu: 1,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        // 一页多少条数据
        perpage: perpage,
        n: perpage,
        remoteplace: 'txt.mqq.all',
        uin: 0,
        needNewCode: 1,
        platform: 'h5'
    }) 
    return jsonp(url, data, options)
}