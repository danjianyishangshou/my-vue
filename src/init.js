import { initState } from "./state"
import { compileToFunction } from './compiler'
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions } from './utils'
export function initMixin(Vue) {//给vue实例添加一些方法或函数 -- 可以在实例的时候直接操作对象
    /**
     * 初始化实例 给实例添加用户配置等
     * @param {实例中的属性和方法} options 
     */
    Vue.prototype._init = function (options) {
        // 当使用vue的时候 传递方法 入$nextTick() 等等
        const vm = this
        // console.log(this);
        // debugger
        vm.$options = mergeOptions(this.constructor.options, options)//将用户的选项传递给实例

        callHook(vm, 'beforeCreate')//内部调用的是beforeCreate
        // 初始化状态
        initState(vm)
        callHook(vm, 'created')//内部调用的是created
        // 解析template函数
        if (options.el) {
            // 用户传入了模版
            vm.$mount(options.el)//实现数据的挂载
        }
    }
    /**
     * 解析模版
     * @param {根节点} el 
     */
    Vue.prototype.$mount = function (el) {
        const vm = this;
        el = document.querySelector(el)
        // 判断用户有没有写render函数 与模版
        //. 所以渲染顺序是先看有没有render函数 然后到template 最后到页面中自行查找
        let ops = vm.$options
        if (!ops.render) {
            let template;//查看有没有写template和模版 没有下颚采用外部
            // 没有写模版 但是写了el
            if (!ops.template && el) {//不存在template模版 直接获取
                // 这种具有兼容性问题 
                template = el.outerHTML
            } else {
                //存在el模版 采取节点下的模版
                template = ops.template
            }
            // 写了template 就使用写的模版 只要有模版就挂载
            if (template) {
                // 这里需要对模版进行编译
                const render = compileToFunction(template)
                ops.render = render//给实例添加render函数 jsx会被编译成h函数
            }
        }
        // 有render直接取render，没有就使用上层逻辑实行后的render
        mountComponent(vm, el)//.组件的挂载
        //全量的 script标签引用的vue.global.js这个编译过程是在览器运行的
        //runtime「运行时」是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的,在运行时中不能使用template
    }
}
