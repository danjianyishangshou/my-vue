const strats = {}

const LIFECYCLE = [
    'beforeCreate',
    'created',
    'mounted'
]
LIFECYCLE.forEach(hook => {
    // 调用生命周期
    strats[hook] = function (p, c) {
        // {} {created.function(){}}=>{created:[fn]}
        if (c) {
            if (p) {
                return p.concat(c)
            } else {
                return [c]//子集有父集没有 则将子集包装成数组
            }
        } else {
            return p// 如果子集没有则用父集即可
        }
    }
})
// 处理components 作用域链
// strats.components = function (parentVal, childVal) {
//     const res = Object.create(parentVal)
//     if (childVal) {
//         for (const key in childVal) {
//             // 返回的是构造函数 可以拿到父集原型上的属性 并且将子集都拷贝到自己身上
//             res[key] = childVal[key]// 直接使用子集的自定义组件覆盖父集的
//         }
//     }
// }
strats.components = function (parentVal, childVal) {
    if (!childVal) {
        return parentVal
    }

    if (!parentVal) {
        return childVal
    }

    const res = Object.create(parentVal || null)
    // 将父组件的 components 拷贝到 res 中
    for (const key in parentVal) {
        res[key] = parentVal[key]
    }

    // 将子组件的 components 拷贝到 res 中，并重写父组件同名组件
    for (const key in childVal) {
        res[key] = childVal[key]
    }
    return res
}

export function mergeOptions(parent, child) {
    // debugger
    const options = {}
    for (let key in parent) {
        mergeFiled(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeFiled(key)
        }
    }

    function mergeFiled(key) {
        // 策略模式 减少if / else
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key]
        }
    }
    return options
}

const hasOwnProperty = Object.prototype.hasOwnProperty
/**
 * hasOwn 函数用于判断一个对象是否拥有某个非继承的属性。下面是其的实现代码：
 * @param {*} obj 
 * @param {*} key 
 * @returns boolean
 */
export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key)
}