import { newArrayProto } from "./array"
import Dep from './dep'
//观察者
class Observer {
    constructor(data) {//data可能是数组/对象
        this.dep = new Dep() // 给每一个属性都增加一个dep 解决新增属性时候与数组发生变化的时候更新

        // defineProperty这只能劫持已经存在的属性 （vue中单独处理的$set $delete）
        // 直接给每一个data添加__ob__属性同时也会给对象添加会在 this.walk中被读取所以需要设置不可枚举
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false//将Observer构造实例挂载到data中去 用于操作数组类型的数据劫持
        })
        // data.__ob__ = this//将Observer构造实例挂载到data中去 用于操作数组类型的数据劫持
        if (Array.isArray(data)) {
            // 如果是数组 
            // 需要重写push等方法 需要保留数组原有的方法 同时需要重写部分方法
            data.__proto__ = newArrayProto//此时 newArrayProto的调用者身上附有该Observer实例的_ob属性,这里同时也给劫持过的数组数据中加上_ob属性
            this.observeArray(data)//数组中放置的是对象或者数组也会被递归劫持 
        } else {
            this.walk(data)
        }
    }
    // 循环对象依次劫持
    walk(data) {
        // ”重新定义“属性 vue的性能瓶颈  性能差
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    //对数组中的每一项进行劫持
    observeArray(data) {
        data.forEach(item => observe(item))
    }
}
/**
 * 不要深层次嵌套,递归影响性能,不存在的属性监控不到 存在的属性要重写方法  vue3中使用proxy 就解决这个问题
 * @param {array} value 
 */
function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        // 让每一项数组都进行依赖收集
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        if (Array.isArray(current)) {
            dependArray(current)
        }
    }
}
export function defineReactive(target, key, value) {//闭包
    // 判断value是否是对象，如果是则进行递归处理
    let childOb = observe(value)//递归处理   childOb上面就包含一个dep 用来收集属性依赖的
    // 每次劫持属性时都增加一个唯一的dep
    let dep = new Dep()//dep造成一个新的对象 dep
    Object.defineProperty(target, key, {
        get() {//取值的时候 会执行get 在watcher中调用getter取值操作会进入
            // 没有渲染的属性将不会被收集
            if (Dep.target) {//代表当前的watcher依赖的该属性
                dep.depend()//让这个属性的收集器记住当前的watcher
                if (childOb) {
                    // 让数组与对象本身也实现依赖收集
                    childOb.dep.depend()
                    // 如果数组中的元素仍然是数组 递归处理
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newValue) {
            if (newValue === value) return
            // 对改变的数据进行代理
            observe(newValue)
            value = newValue
            dep.notify()//通知dep更新
        }
    })
}
// 响应式
export function observe(data) {
    // 对这个对象进行劫持
    if (typeof data !== 'object' || data == null) {
        return
    }
    // 如果数组数据被劫持过了就返回
    if (data.__ob__ instanceof Observer) {
        return data.__ob__
    }
    // 如果一个对象被劫持过了，就不需要载次劫持（要判读是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
    return new Observer(data)
}
