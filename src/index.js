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

// ++++++++为了方便观察前后的虚拟节点++ 测试使用+++++++
let render1 = compileToFunction(`
<ul key='ul' id='123' style='color:red'>
    <li key='a'>a</li>
    <li key='b'>b</li>
    <li key='c'>c</li>
    <li key='d'>d</li>
</ul>`)
let vm1 = new Vue({ data: { name: '张三' } })
let prevVnode = render1.call(vm1)
let el = createElm(prevVnode)
document.body.appendChild(el)

let render2 = compileToFunction(`
<ul key='ul' id='123' style='color:red;backgroundColor:pink;'>
    <li key='p'>p</li>
    <li key='m'>m</li>
    <li key='a'>a</li>
    <li key='b'>b</li>
    <li key='c'>c</li>
    <li key='q'>q</li>
</ul>`)
let vm2 = new Vue({ data: { name: '李三' } })
let nextVnode = render2.call(vm2)


// let newEl = createElm(nextVnode)
// 不进行比较直接替换  diff算法是先比较差异后再替换
/**
diff 比较是 层层比较，平级比对，深度优先
 *  */
setTimeout(() => {
    // el.parentNode.replaceChild(newEl, el)
    patch(prevVnode, nextVnode)
}, 1000)

export default Vue;