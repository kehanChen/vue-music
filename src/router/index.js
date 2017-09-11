// 路由
import Vue from 'vue'
import Router from 'vue-router'
//vue文件后缀可以不写
import Rank from 'components/rank/rank'
import Recommend from 'components/recommend/recommend'
import Search from 'components/search/search'
import Singer from 'components/singer/singer'
import UserCenter from 'components/user-center/user-center'
//注册Router
// 配置的子路由的组件，要注册
// 配置子路由，用于开发歌手详情页面
import SingerDetail from 'components/singer-detail/singer-detail'
// 配置子路由，用于推荐列表的歌单详情页面
import Disc from 'components/disc/disc'
// 配置子路由，用于排行列表的歌单详情页面
import TopList from 'components/top-list/top-list'
Vue.use(Router)

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        redirect: '/recommend'
    }, {
        path: '/rank',
        component: Rank,
        children: [
            {
                path: ':id',
                component: TopList
            }
        ]
    }, {
        path: '/recommend',
        component: Recommend,
        children: [
            {
                path: ':id',
                component: Disc
            }
        ]
    }, {
        path: '/search',
        component: Search,
        children: [
            {
                path: ':id',
                component: SingerDetail
            }
        ]
    }, {
        path: '/singer',
        component: Singer,
        children: [
            // singer页面的子路由，用于歌手详情页面
            {
                path: ':id',
                component: SingerDetail
            }
        ]
    },{
        path: '/user',
        component: UserCenter
    }]
})


