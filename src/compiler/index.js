import { parseHTML, defaultTagRE } from './parse'
/**
 * 处理属性
 * @param {*} attrs 
 * @returns 
 */
function genProps(attrs) {
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            // 需要将color：red处理成{color:'red'}
            let obj = {}
            attr.value.split(';').forEach(e => {
                let [key, value] = e.split(':')
                obj[key] = value
            })
            //解析成对象形式后赋值
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}
/**
 * 处理子节节点逻辑
 * @param {*} node 
 * @returns 
 */
function gen(node) {
    // 后代非文本节点
    if (node.type === 1) {
        return codegen(node)
    } else {
        // 文本节点
        // 创建文本节点 填充文本 文本存在纯文本 与da
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            //数据层面
            //_v( _s(name)+'hello'+_s(age))
            let tokens = []// 储存节点内容
            let match;
            defaultTagRE.lastIndex = 0//重置正则全局匹配后的位置问题
            let lastIndex = 0//记录正则匹配位置
            while ((match = defaultTagRE.exec(text))) {
                let index = match.index//正则匹配位置
                if (index > lastIndex) tokens.push(JSON.stringify(text.slice(lastIndex, index)))//将匹配到的文本存储到数组中
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length//更新匹配位置
            }
            // 最后依然饱含内容
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))//将剩余内容存储到数组中
            }
            return `_v(${tokens.join('+')})`
        }
    }
}
/**
 * 处理子代
 * @param {*} ast 
 */
function genChildren(children) {
    return children.map(child => gen(child)).join(',')
}
/**
 * 解析成文本格式
 * @param {*} ast 
 * @returns 主要解析成  
 *  _c 就是render函数
 *  _v处理文本节点   
 *  _s处理data数据
 */
function codegen(ast) {
    let children = genChildren(ast.children)
    let code = ` _c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'},${ast.children.length ? `${children}` : ``})`
    return code
}
/**
 * 对模版进行编译
 * @param {template模版} el 
 */
export function compileToFunction(template) {
    // 1. 就是将template转化为ast语法树
    let ast = parseHTML(template)
    // 2. 生成render方法 render方法执行后的结果就是 虚拟DOM
    // 模版引擎的实现原理就是 with+ new Function
    let code = codegen(ast)
    code = `with(this){return ${code}}`
    let render = new Function(code)//根据代码生成函数
    return render
}