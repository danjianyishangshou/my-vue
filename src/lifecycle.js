import { createElementVNode, createTextVNode } from './vdom'
import Watcher from './observe/watcher'
import { patch } from './vdom/patch'

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