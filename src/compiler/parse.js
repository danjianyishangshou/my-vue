//! 利用栈结构来处理成树结构
//.vue2正则匹配标签
//. vue3中采用的而不是正则
// const ncname = `[a-zA-z_][\\-\\.0-9_a-zA-Z]*`
// const qnameCapture = `((?:${ncname}\\:)?${ncname})?`
// const startTagOpen = new RegExp(`^<${qnameCapture}`)//匹配到的开始标签名
// const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)//匹配结束标签的名字
// const attribute = /^\s*([^\s"'<>/=]+)\s*(?:=\s*)?(?:"([^"]*)"|'([^']*)'|([^"'<>\s`]+))?/; //匹配属性 第一个分组是属性的key  value就是3/4/5分组
// const startTagClose = /^\s*(\/?)>/;//标签结束闭合 可以 />或者 >
// const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;//匹配胡子语法

// 标签名 a-aaa
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
// 命名空间标签 aa:aa-xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 开始标签-捕获标签名
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// 结束标签-匹配标签结尾的 </div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// 匹配属性
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配标签结束的 >
const startTagClose = /^\s*(\/?)>/;
// 匹配 {{ }} 表达式
export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
/**
 * html解析生成树结构
 * @param {html结构} html 
 * @returns 
 */
export function parseHTML(html) {
    html = html.trim()
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = []//创建一个栈
    let currentParent;//指针指向栈中最后一项
    let root
    // 转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    function createASTText(text, parent) {
        return {
            type: TEXT_TYPE,
            text,
            parent
        }
    }
    function startLabel(tag, attrs) {
        let node = createASTElement(tag, attrs)
        if (!root) {
            root = node
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)//加入栈中
        currentParent = node// 指针指向栈中最后一个
    }
    function chars(text) {
        text = text.replace(/\s/g, '')
        text && currentParent.children.push(createASTText(text, currentParent))
    }
    function endLabel(tag) {
        let node = stack.pop()//检验标签是否合法
        currentParent = stack[stack.length - 1]//指针向前移动一位
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1],//标签名称
                attrs: [],
            }
            //前进删除
            advance(start[0].length)
            // 如果不是开始标签的结束 就一直匹配下去
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
            }
            if (end) {
                advance(end[0].length)
            }
            return match
        }
        return false
    }
    while (html) {
        // debugger
        // 如果textEnd为0就是开始标签
        // 大于0 就是文本结束的位置
        let textEnd = html.indexOf('<');//如果索引是0，就说明是个标签 
        if (textEnd == 0) {
            const startTagMatch = parseStartTag()//开始匹配的结果
            if (startTagMatch) {//解析到开始的标签
                startLabel(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {//匹配结束标签
                advance(endTagMatch[0].length)
                endLabel(endTagMatch)
                continue
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd)//文本内容
            if (text) {
                chars(text)
                advance(text.length)//解析到的文本
            }
        }
        if (textEnd == -1) {
            break
        }
    }
    return root
}