import { isSameVnode } from './index'
/**
 * 创建真实DOM
 * @param {string} vnode 
 * @returns 
 */
export function createElm(vnode) {
    let { tag, data, key, children, text } = vnode
    if (key) data.key = key
    if (typeof tag === 'string') {
        // 这里将真实节点与虚拟节点对应起来，
        vnode.el = document.createElement(tag)
        // 元素赋值属性
        patchProps(vnode.el, {}, data)
        if (children) {
            children.forEach(child => {
                vnode.el.appendChild(createElm(child))
            })
        }
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
/**
 * 更新属性,给对应的节点添加属性
 */
export function patchProps(el, oldProps = {}, props = {}) {
    // 老的属性中有 新的没有要删除老的
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}
    for (let key in oldStyles) {//老的样式中有的 新的没有的 则删除
        if (!(key in newStyles)) {
            el.style[key] = ''
        }
    }
    for (let key in oldProps) {//老的属性中有
        if (!(key in props)) {// 新的没有 删除属性
            el.removeAttribute(key)
        }
    }
    for (const key in props) {//使用新的覆盖老的
        if (key === 'style') {
            for (const styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }

}
/**
 * 将获取到的虚拟dom转化成真实dom
 *在vue2/3中 既有初始化功能也有更新功能
 * @param {string} oldVNode 老节点节点
 * @param {string} vnode  新节点
 */
export function patch(oldVNode, vnode) {
    const isRelElement = oldVNode.nodeType//nodeType原生的方法 判断是不是原生节点 
    /**
     * nodeType 只读属性
     * 如果节点是一个元素节点，nodeType 属性返回 1。
     * 如果节点是属性节点, nodeType 属性返回 2。
     * 如果节点是一个文本节点，nodeType 属性返回 3。
     * 如果节点是一个注释节点，nodeType 属性返回 8。
     * 整个文档（DOM树的根节点） nodeType 属性返回  9
      */
    if (isRelElement) {
        // 真实元素
        // 拿到真实元素的父级元素，生成新的dom 替换原来老的元素（删除老的元素，追加新的元素）
        const elm = oldVNode
        const parentElm = elm.parentNode
        //创建dom
        const newElm = createElm(vnode)
        // 想插入新的节点到老的后面 再删除老的
        parentElm.insertBefore(newElm, elm.nextSibling)//nextSibling是指的目标节点的后续节点
        parentElm.removeChild(elm)
        return newElm
    } else {
        // diff算法

        // console.log(oldVNode, vnode);
        // 1，两个节点不是同一个节点 直接删除老的节点 替换为新的节点
        // 通过一个节点是同一个人节点 （判断节点的tag和节点key） 比较两个节点的属性是否存在差异，（复用老的节点，将差异的属性更新）
        // 3，节点比较完毕后就需要比较两个节点的子节点
        patchVnode(oldVNode, vnode)
    }
}
/**
 * 进行diff比较
 * @param {*} oldVNode 
 * @param {*} vnode 
 * @returns 
 */
function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {//tag or key 有一个不同时 不是同一个节点
        // 新节点替换老的节点
        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
        return el
    }
    // 文本的情况 tag or key 都相同的情况
    let el = vnode.el = oldVNode.el//复用老节点的元素
    if (!oldVNode.tag) {// 文本
        if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.text // 新文本覆盖老的文本
        }
    }
    // 是标签 需要比对 标签的属性 
    patchProps(el, oldVNode.data, vnode.data)

    // 比较子节点 
    //  只用一方有子节点 ，双方都有子节点
    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []
    if (oldChildren.length && newChildren.length) {
        // 完整的diff算法
        updateChildren(el, oldChildren, newChildren)
    } else if (newChildren.length) {
        // 没有老的只有新的
        mountChildren(el, newChildren)
    } else if (oldChildren.length) {
        el.innerHTML = ''
    }
    return el
}
/**
 * 挂载新节点
 * @param {*} el 
 * @param {*} newChildren 
 */
function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        el.appendChild(createElm(newChildren[i]))
    }
}
/**
 * 都存在的时候更新children
 * @param {*} el 
 * @param {*} oldChildren 
 * @param {*} newChildren 
 */
function updateChildren(el, oldChildren, newChildren) {
    // 为了比较两个子节点 的时候 减少性能消耗 有一些优化手段
    //常用 操作数组 有push,shift.pop,unshift,reverse,sort
    // vue中通过双指针的方式优化  新旧节点 个有一个首指针，一个尾指针 首位指针>=尾指针
    // 第一步 先前前指针比较 有一方首指针 大于尾指针，就结束 执行插入或删除操作
    // 第二步 如果前前指针不相等 且没有走第一步，就走尾尾指针比较  相等操作
    // 第三步 如果前两步没有跳出比较 就执行 首尾指针比较 与尾首指针比较
    // 指针
    let oldStartIndex = 0,
        newStartIndex = 0,
        oldEndIndex = oldChildren.length - 1,
        newEndIndex = newChildren.length - 1;
    // 节点
    let oldStartVnode = oldChildren[0],
        newStartVnode = newChildren[0],
        oldEndVnode = oldChildren[oldEndIndex],
        newEndVnode = newChildren[newEndIndex];
    // 有任何一方 首指针大于尾指针结束任务
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

    }
    console.log(
        oldStartVnode,
        newStartVnode,
        oldEndVnode,
        newEndVnode
    );
}
