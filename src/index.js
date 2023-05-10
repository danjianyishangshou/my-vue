import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import Watcher, { nextTick } from './observe/watcher'
// 将所有的方法都耦合在一起
/**
 * 创建vue构造函数
 * @param {用户的选项} options 
 */
function Vue(options) {
    // 默认调用init
    this._init(options)
}
Vue.prototype.$nextTick = nextTick
initMixin(Vue)//扩展了init方法 解析模版生成AST树  生成响应式
initLifeCycle(Vue)//在data、el、...、methods中扩展扩展是虚拟DOM生成真实DOM

/**
 * watch函数 所有的写法最终都会走向
 * @param {*} exprOrFn 
 * @param {*} cb 
 * @param {*} options 
 */
Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    console.log(exprOrFn, cb, options);
    // 创建侦听watcher
    // 侦听的对象变化了 直接调用cb
    new Watcher(this, exprOrFn, { user: true }, cb)
}

export default Vue;