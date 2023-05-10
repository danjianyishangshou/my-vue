import { observe } from './observe/index'
import Watcher from './observe/watcher';
import Dep from './observe/dep'
// 项目初始化
export function initState(vm) {
    // 获取所有的选项
    const opts = vm.$options;
    if (opts.data) initData(vm)
    if (opts.computed) initComputed(vm)
    if (opts.watch) initWatch(vm)
}
// 代理处理vm._data.name的问题 直接使用vm.name 
// 这里代理了两次
function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newVal) {
            vm[target][key] = newVal
        }
    })
}
/**
 * 初始化状态数据
 * @param {*} vm 
 */
function initData(vm) {
    // 用户定义data 可能是函数/对象 [在vue3中全是函数]
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm) : data//data是用户的属性
    // 劫持数据，做响应式vue2使用Object.defineProperty
    // vue中定义了监视器模块
    vm._data = data//把返回的数据挂载到vm中
    observe(data)//同时监听数据的变化vm层
    // 将vm_data 用vm代理
    for (const key in data) {
        proxy(vm, '_data', key)
    }
}
/**
 * 初始化计算属性
 */
function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = vm._computedWatchers = {}//保存Watcher对象 并将计算属性的watcher放在vm身上
    for (const key in computed) {
        const userDef = computed[key]
        // 监控计算属性中的get的变化
        // computed有两种写法
        const fn = typeof userDef === 'function' ? userDef : userDef.get
        // 如果直接new Watcher就会立刻执行fn 加个配置项不让直接执行
        watchers[key] = new Watcher(vm, fn, { lazy: true })
        // const setter = userDef.set || (() => { })
        defineComputed(vm, key, userDef)
    }
}
/**
 * 劫持计算属性
 * @param {*} target 
 * @param {*} key 
 * @param {*} userDef 
 */
function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (() => { })
    // 劫持每一个computedWatcher
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}
/**
 * 创建计算属性getter
 * 计算属性本身根本不会收集依赖 只会让自己的依赖属性去收集依赖
 */
function createComputedGetter(key) {
    // 监测是否执行getter
    return function () {
        // this指向vm
        const watcher = this._computedWatchers[key]
        // 如果存在dirty属性
        if (watcher.dirty) {
            // 如果是存在计算给的结果 （如果是脏的）就执行用户传入的函数
            watcher.evaluate()//求值后watcher中的dirty就为脏 不会再次进入
        }
        if (Dep.target) {//计算属性出栈后 还好执行渲染watcher应该让watcher里面的属性 也好去收集上一层的watcher
            watcher.depend()//调用渲染逻辑
        }
        return watcher.value
    }
}
/**
 * 创建初始化watch对象 需要侦听的目标全部创建watcher
 */
function initWatch(vm) {
    let watch = vm.$options.watch;
    for (const key in watch) {
        // 字符串，函数，数组三种情况
        const hander = watch[key];
        if (Array.isArray(hander)) {
            for (let i = 0; i < hander.length; i++) {
                createWatcher(vm, key, hander[i])
            }
        } else {
            createWatcher(vm, key, hander)
        }
    }
}
/**
 * 创建侦听Watcher
 * @param {*} vm 实例
 * @param {string,function ,object} exprOrFn  侦听的对象 :
 * @param {function } hander 执行的函数
 * @returns 
 */
function createWatcher(vm, exprOrFn, hander) {
    // hander 三种情况 函数，字符串，对像
    if (typeof hander === 'string') {
        hander = vm[hander]
    }
    // 执行vm.$watch方法
    return vm.$watch(exprOrFn, hander)
}