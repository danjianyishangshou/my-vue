let id = 0
// 每个属性都在存在一个dep 用来记录依赖关联的watcher观察者  每天有渲染的属性不会收集依赖
class Dep {
    constructor() {
        this.id = id++//属性的dep要收集watcher
        this.subs = []// 这里存放着当前属性对应的watcher有哪些
    }
    // 暴露dep给watcher监听绑定
    static target = null//静态属性 全局
    // 通知watcher来收集dep实例
    depend() {
        // 当调用get的时候 watcher就到赋值给了静态属性 将存在的静态方法拿到
        // this.subs.push(Dep.target)// 不需要重复的watcher
        // 让watcher记住dep 把dep传给watcher   Dep.target现在是watcher实例 
        // 使watcher记录dep 
        Dep.target.addDep(this)
    }
    // 被watcher通知后来收集watcher
    addSub(watcher) {
        // dep里面收集watcher
        this.subs.push(watcher)
    }
    // 根据收集的依赖进行更新 数据更新 在数据劫持的set中调用 set发生变化调用该方法
    notify() {
        // 调用里面的watcher来更新 如果没有收集的不会更新视图
        this.subs.forEach(watcher => {
            watcher.update()
        })// 告诉依赖的watcher更新视图
    }
}
// 维护一个操作watcher的栈
let stack = []
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}

export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

// 另一种定义方式
// Dep.target = null
export default Dep

// 每一个属性都有一个Dep实例 （被观察者），watcher就是观察者 （属性变化了会通知观察者去更新）==》观察者模式