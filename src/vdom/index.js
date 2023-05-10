// 构建虚拟节点的方法
// h(),_c()
export function createElementVNode(vm, tag, data, ...children) {
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }
    return vnode({ vm, tag, key, data, children })
}

//_v()
export function createTextVNode(vm, text) {
    return vnode({ vm, text })
}
/**
 * 虚拟DOM是描述dom元素,可以增加一些自定义属性
 * ast 做的事语法层面的转化 它描述的是语法本身 可以描述js css html等
 */
function vnode({ vm, tag, key, data, children, text }) {
    return {
        vm, tag, key, data, children, text
        // 插槽 指令等
    }
} 