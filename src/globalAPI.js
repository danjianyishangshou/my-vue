import { mergeOptions } from './utils'
export function initGlobalAPI(Vue) {
    // 静态方法
    Vue.options = {
        _base: Vue
    }
    // 混入
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin)
        return this
    }
    // 组件api  原理就是创造一个子类 （构造函数）使得子类继承Vue上的方法  最中利用继承来解析子组件实例
    Vue.extend = function (options) {
        // 根据用户的参数 返回一个构造函数而已
        function Sub(options = {}) {//最终使用一个组件 就是new一个实例
            this._init(options)//默认对子类进行初始化操作
        }
        //复用父类方法 方法
        Sub.prototype = Object.create(Vue.prototype)
        Sub.prototype.constructor = Sub
        //将全局components 与保存用户传递的component进行合并
        Sub.options = mergeOptions(Vue.options, options)
        return Sub
    }
    Vue.options.components = {}//全局的指令 Vue.options.directives
    /**
     * 全局组件
     * @param {string } id  组件名
     * @param {*} definition  定义
     */
    Vue.component = function (id, definition) {
        // definition 可能是对象或者函数 两种写法
        // 如果已经是函数 则不再处理
        if (typeof definition !== 'function') definition = Vue.extend(definition)//给出一个子组件实例
        Vue.options.components[id] = definition
    }
}