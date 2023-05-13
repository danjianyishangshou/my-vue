# vue源码学习

## 初始化模块

1.使用Rollup搭建开发环境
2.Vue响应式原理实现，对象属性劫持
3.实现对数组的方法劫持I
4.模板编译原理，将模板转化成ast语法树
5.代码生成，实现虚拟DOM
6.通过虚拟DOM生成真实DOM

## 安装模块

` rollup rollup-plugin-babel @babel/core @babel/preset-env -D `起步插件

`@rollup/plugin-node-resolve` node解析 可以省略index

## 初始化数据,实现对象的响应式

## 解析模版成ast树

## render函数 将虚拟DOM转化成真实DOM

## 实现vue中的依赖收集(观察者模式)

vue收集依赖实现步骤
1.观察者模式实现依赖收集
2.异步更新策略
3.mixin的实现原理

### 观察者模式

我们可以给模板中的属性增加一个收集器dep
页面渲染的时候我们将渲染逻辑封装到watcher中 vm._update(vm._render());
让dep记住这个watcher即可，稍后属性变化了可以找到对应的dep中存放的watcher进行重新渲染

每一个属性都有一个Dep实例 （被观察者），Watcher实例就是观察者 （属性变化了会通知观察者去更新）==》观察者模式

没有在页面中使用数据并不会被收集

### 计算属性

### watch实现原理

### 数组响应式原理

### diff算法

### 组件渲染

- Vue.component 作用就是实现全局的定义, id和对应的definition  Vue.options.components[组件名]=包装成构造函数(定义)
- Vue.extend 返回一个子类 而且会在子类在记录自己的选项 (为什么vue的组件中的data不能是一个对象)
    每次调用实例的时候都会调用初始化_.init

```js
function extend(options){
    function Sub(){
        this._init()//子组件的初始化
    }
    Sub.options=options
    return Sub
}
let Sub=Vue.extend({data:数据源})
new Sub()  mergeOptions(Sub.options)//
new Sub()  mergeOptions(Sub.options)// 如果data是一个对象  就会引发数据污染
```

- 创建子类的构造函数,会将全局的组件和自己的身上定义的组件进行合并(组件的合并,会先查找自己再查找全局)
- 组件的渲染 会开始渲染会编译组件的模版变成render函数==>调用render方法
- createElementVnode会根据tag作区分 自定义组件还是原始标签,如果是组件会创建组件的虚拟节点(组件增加componentOptions选项{Ctor}) 之后创建组件的真实节点 只需要new Ctor()
- 创建真实节点
