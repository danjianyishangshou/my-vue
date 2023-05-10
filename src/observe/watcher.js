import Dep, { pushTarget, popTarget } from './dep'
// 观察者
let id = 0// 为了实现组件化开发，进行标识后 实现局部更新

// 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放在Dep.target上
// 2）调用_render() 会取值 走到数据劫持中的get中
class Watcher {//不同组件有不同的watcher 
    constructor(vm, exprOrFn, options, cb) {
        this.id = id++
        this.renderWatcher = options//渲染watcher
        if (typeof exprOrFn === 'string') {
            exprOrFn = function () {
                return vm[exprOrFn]//就是侦听的对象
            }
        }
        this.getter = exprOrFn//getter 调用后就会发生取值渲染操作
        this.cb = cb//watch方法代执行的回调
        this.deps = []//后续实现组件卸载 清理工作 实现计算属性
        this.depsId = new Set()
        // 计算属性用来控制fn的执行
        this.lazy = options ? options?.lazy : undefined
        // 用来存储计算属性的缓存值
        this.dirty = this.lazy
        this.oldVal = this.lazy ? undefined : this.get()//初次默认调用，被计算属性控制的属性受控制调用
        // this.value = undefined
        this.vm = vm
        // 判断是不是用户自己定义的watcher 侦听器
        this.user = options ? options.user : undefined
    }
    // 处理计算属性
    evaluate() {
        this.value = this.get()//回去到用户函数的返回值 并且标志为脏
        this.dirty = false
    }
    get() {
        // 处理单一的watcher
        // Dep.target = this//把当前的watcher交给dep。target全局唯一的静态属性
        // 处理多个watcher 「渲染wtr与计算属性wtr，」
        pushTarget(this)
        let value = this.getter.call(this.vm)//会去vm上取值 [vm._update(vm._render)]
        // Dep.target = null//dep收集依赖完成 将标识移除
        // 移除调用过的栈中的watcher
        popTarget()
        return value;
    }

    addDep(dep) {//一个组件对应多个属性 重复的属性也不用记录
        let id = dep.id
        // 去重后记录dep
        if (!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            // 让那个dep记录watcher 由于重复的属性不会进入同一个watcher 所以交给dep也是去重后的watcher
            dep.addSub(this)
        }
    }
    // 计算属性watcher记录其他watcher 依赖 来执行渲染watcher
    depend() {
        let i = this.deps.length
        while (i--) this.deps[i].depend()// 让计算属性watcher也收集其他watcher
    }
    // 更新视图
    update() {
        // 使用咱脏值来控制计算属性更新
        if (this.lazy) {
            this.dirty = true
        } else {
            // 异步优化更新视图的方法 
            queueWatcher(this)//b把当前的watcher暂存起来
        }
    }
    run() {
        // 可以拿到新值
        let newVal = this.get()
        if (this.user) {
            console.log(newVal, this.oldVal);
            this.cb.call(this.vm, newVal, this.oldVal)
        }
    }
}
// 刷新更新任务队列要实现异步更新的操作
let queue = []//watcher队列
let has = {}//去重watcher
let pending = false//防抖
/**
 *  刷新调度队列方法
 */
function flushSchedulerQueue() {
    // 拷贝queue
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    for (let i = 0; i < flushQueue.length; i++) {
        flushQueue[i].run()// 在刷新的过程中还有新的watcher 放到queue中
    }
}
/**
 * 调度water列队列的water执行更新操作 实现异步更新只触发run函数一次
 * @param {*} watcher 
 */
function queueWatcher(watcher) {
    const id = watcher.id
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true
        // 不管update执行多少次 但是最终只执行一轮刷新 防抖执行
        if (!pending) {
            // 将带渲染的函数放到下一次宏任务中执行
            nextTick(flushSchedulerQueue)
            pending = true
        }
    }
}
// 用来实现nextTick 都是放在了对列中 遍历队列实现异步一次性全部更新 
let callbacks = []
let waiting = false
function flushCallbacks() {
    let cbs = callbacks.slice(0)
    waiting = false
    callbacks = []
    cbs.forEach(cb => cb())
}
// vue中nextTick 没有直接使用某一个api 而是采用优雅的降级的方式
// 既有同步又有异步 放到对列中是行为是同步 更新调用flushCallback函数的时候是异步
// 内部先采用的是promise（ie不兼容） ，不兼容promise采用MutationObserver（h5的api），如果还不兼容 采用ie的专用方案 setImmediate
// 都不支持，最后是setTimeout
/**
 * 优雅降级 nextTick实现异步的策略
 * @param {*} flushCallbacks 
 */
function timeFunc(flushCallbacks) {
    if (Promise) {
        Promise.resolve().then(flushCallbacks)
    } else if (MutationObserver) {
        let observer = new MutationObserver(flushCallbacks)
        let textNode = document.createTextNode(1)
        observer.observe(textNode, { characterData: true })
        textNode.textContent = 2//文本变化重新执行
    } else if (setImmediate) {
        setImmediate(flushCallbacks)
    } else {
        setTimeout(flushCallbacks)
    }
}
/**
 * 暴露出去nextTick的函数 用户更新调度run函数 也可以暴露出去共用户使用 挂载到了原型$nextTick
 * @param {*} cb 
 */
export function nextTick(cb) {// 先内部还是先外部取决于数据的变化
    callbacks.push(cb)
    if (!waiting) {
        timeFunc(flushCallbacks)
        // vue3中  不考虑ie， Promise.resolve().then(flushCallbacks)
        waiting = true
    }
}

// dep和watcher是双向记录关系
// 需要给每一个属性「数据」增加一个dep，目的就是为了收集watcher
// 一个组件中 有多个属性（n个属性对应一个组件） n个dep对应一个watcher
// 一个属性对应着多个组件 1个dep对应多个watcher
//  多对多的关系
export default Watcher