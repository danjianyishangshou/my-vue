import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './state'
import { initGlobalAPI } from './globalAPI'
import { compileToFunction } from './compiler'
// 临时
import { createElm, patch } from './vdom/patch'
// 将所有的方法都耦合在一起
/**
 * 创建vue构造函数
 * @param {用户的选项} options 
 */
function Vue(options) {
    // 默认调用init
    this._init(options)
}

initMixin(Vue)//扩展了init方法 解析模版生成AST树  生成响应式
initLifeCycle(Vue)//在data、el、...、methods中扩展扩展是虚拟DOM生成真实DOM
initStateMixin(Vue)//实现了nextTick 与$watch
initGlobalAPI(Vue)// 全局api的实现

export default Vue;