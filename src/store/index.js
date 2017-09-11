import Vue from 'vue'
import Vuex from 'vuex'

// vuex初始化.可以记录上一条数据和当前数据
// 所有的mutation-types和getter都是用* as actions语法
import * as actions from "./actions"
import * as getters from "./getters"
import state from "./state"
import mutations from "./mutations"

// 用一些插件.在每次修改state通过mutation的话，每次会打印东西（上次，本次）
import createLogger from "vuex/dist/logger"
// 注册插件
Vue.use(Vuex)
// 运行dev是dev环境，运行bulid是production环境。debug是boolean，线下严格环境要为true
const debug = process.env.NOOD_ENV !== 'production'
// 暴露借口，实例
export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    strict: debug,
    plugins: debug ? [createLogger()] : []
})