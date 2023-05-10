# vue源码学习

## 第一天

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
