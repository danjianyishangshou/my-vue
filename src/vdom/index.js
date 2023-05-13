// 原始标签数组
function makeMap(str, expectsLowerCase) {
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}
// 常用的原始数组
const isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,strong,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,sub,sup,time,u,var,wbr,' +
    'area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
)

/**
 * 是否是原始标签
 */
const isReservedTag = (tag) => {
    return isHTMLTag(tag)
}

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
    // return vnode({ vm, tag, key, data, children })
    if (isReservedTag(tag)) {
        return vnode({ vm, tag, key, data, children })
    } else {
        // 自定义标签 创建一个组件的虚拟节点（包含组件的构造函数）
        let Ctor = vm.$options.components[tag]
        // Ctor 就是组件的定义 可能是一个Sub类 还有可能是组件的obj选项
        if (Ctor) {
            return createComponentVNode(vm, tag, key, data, children, Ctor)
        }
    }
}
function createComponentVNode(vm, tag, key, data, children, Ctor) {
    if (typeof Ctor === 'function' || typeof Ctor === 'object') {
        Ctor = vm.$options._base.extend(Ctor)
    }
    data.hook = {
        init(vnode) {//稍后创造真实节点的操作  如果是组件则调用此init方法
            let instance = vnode.components = new vnode.componentsOptions.Ctor// 保存组件的实例到虚拟节点上
            instance.$mount()//instance.$el
        }
    }
    return vnode({ vm, tag, key, data, children, componentsOptions: { Ctor } })
}
//_v()
export function createTextVNode(vm, text) {
    return vnode({ vm, text })
}
/**
 * 虚拟DOM是描述dom元素,可以增加一些自定义属性
 * ast 做的事语法层面的转化 它描述的是语法本身 可以描述js css html等
 */
function vnode({ vm, tag, key, data, children, text, componentsOptions }) {
    return {
        vm, tag, key, data, children, text, componentsOptions//组件的构造函数
        // 插槽 指令等
    }
}

/**
 * 比较两个节点
 * @param {*} vnode1 
 * @param {*} vnode2 
 * @returns 
 */
export function isSameVnode(vnode1, vnode2) {
    return (
        vnode1.key === vnode2.key &&
        vnode1.tag === vnode2.tag
    )
}