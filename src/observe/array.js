// 重写数组方法
let oldArrayProto = Array.prototype//获取原来的方法
export let newArrayProto = Object.create(oldArrayProto)//创建新的方法对象，复制原来的方法
let methods = [//找到直接作用的原数组的方法
    'push',
    'pop',
    'unshift',
    'shift',
    'splice',
    'reverse',
    'sort'
]
methods.forEach(method => {
    // 注意调用的this指向调用方法的目标对象，而不是新建的数组对象 注意不要使用箭头函数
    newArrayProto[method] = function (...args) {
        const result = oldArrayProto[method].call(this, ...args)//这里重写了数组的方法，当时内部还是使用的原来的属性方法 函数的劫持 切片编程
        // 需要对新增的数据再次进行劫持
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inArray = args.slice(2)
            default:
                break;
        }
        if (inserted.length) {
            // 获取调用者身上的实例方法暂存在_ob属性上
            ob.observeArray(inserted)
        }
        // 数组变化了通知watcher更新视图
        ob.dep.notify()
        return result
    }
})
