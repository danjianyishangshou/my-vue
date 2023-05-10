import { createElementVNode, createTextVNode } from './vdom'
import Watcher from './observe/watcher'
/**
 * 创建真实DOM
 * @param {string} vnode 
 * @returns 
 */
function createElm(vnode) {
    let { tag, data, key, children, text } = vnode
    if (key) data.key = key
    if (typeof tag === 'string') {
        // 这里将真实节点与虚拟节点对应起来，
        vnode.el = document.createElement(tag)
        // 元素赋值属性
        patchProps(vnode.el, data)
        if (children) {
            children.forEach(child => {
                vnode.el.appendChild(createElm(child))
            })
        }
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
/**
 * 更新属性,给对应的节点添加属性
 */
function patchProps(el, props) {
    for (const key in props) {
        if (key === 'style') {
            for (const styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}
/**
 * 将获取到的虚拟dom转化成真实dom
 *在vue2/3中 既有初始化功能也有更新功能
 * @param {string} oldVNode 老节点节点
 * @param {string} vnode  新节点
 */
function patch(oldVNode, vnode) {
    const isRelElement = oldVNode.nodeType//nodeType原生的方法 判断是不是原生节点 
    /**
     * nodeType 只读属性
     * 如果节点是一个元素节点，nodeType 属性返回 1。
     * 如果节点是属性节点, nodeType 属性返回 2。
     * 如果节点是一个文本节点，nodeType 属性返回 3。
     * 如果节点是一个注释节点，nodeType 属性返回 8。
     * 整个文档（DOM树的根节点） nodeType 属性返回  9
      */
    if (isRelElement) {
        // 真实元素
        // 拿到真实元素的父级元素，生成新的dom 替换原来老的元素（删除老的元素，追加新的元素）
        const elm = oldVNode
        const parentElm = elm.parentNode
        //创建dom
        const newElm = createElm(vnode)
        // 想插入新的节点到老的后面 再删除老的
        parentElm.insertBefore(newElm, elm.nextSibling)//nextSibling是指的目标节点的后续节点
        parentElm.removeChild(elm)
        return newElm
    } else {
        // diff算法
    }
}
export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        // 将获取到的虚拟dom转化成真实dom
        // 在vue2/3中 既有初始化功能也有更新功能
        vm.$el = patch(el, vnode)
    }
    // _c('div',{},...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    // _v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value)
    }
    Vue.prototype._render = function () {
        // 让with中的this指向vm
        return this.$options.render.call(this)//通过ast语法转译后生成的render方法
    }
}
export function mountComponent(vm, el) {//这里的el是通过querySelector处理过的
    vm.$el = el
    // 1,  调用render函数 产生虚拟节点 虚拟DOM
    //vm._render()//vm.$options.render() 返回的虚拟节点
    // 2，根据虚拟DOM生成真实的DOM
    // 包裹在watcher者实例中，进行模块开发
    // vm._update(vm._render())
    const updateComponent = () => {
        vm._update(vm._render())
    }
    new Watcher(vm, updateComponent)
    // 3，插入到el元素中
}

/**
 * vue核心流程
 * 1，创造了响应式
 * 2，模版转成了ast语法树
 * 3，将ast树转化成了render函数
 * 4，后续每次数据更新不再需要重新生成解析ast树 而是只执行render函数
 *      render 函数会产生虚拟节点（使用响应式数据）根据虚拟节点生成真正的DOM节点
 */