import Vue from 'vue'
import App from './App'
import 'babel-polyfill'
import fasrclick from 'fastclick'
import router from './router'
// 引用
import VueLazyLoad from 'vue-lazyload'
import store from "./store"
//common在webpack.base.conf.js给了别名，'common': resolve('src/common')
import 'common/stylus/index.styl'

fasrclick.attach(document.body)
// 注册
Vue.use(VueLazyLoad, {
    loading: require('common/image/default.png')
})
    /* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App),
    store,
    router
})