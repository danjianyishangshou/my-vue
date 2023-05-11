(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  // 重写数组方法
  var oldArrayProto = Array.prototype; //获取原来的方法
  var newArrayProto = Object.create(oldArrayProto); //创建新的方法对象，复制原来的方法
  var methods = [
  //找到直接作用的原数组的方法
  'push', 'pop', 'unshift', 'shift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    // 注意调用的this指向调用方法的目标对象，而不是新建的数组对象 注意不要使用箭头函数
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //这里重写了数组的方法，当时内部还是使用的原来的属性方法 函数的劫持 切片编程
      // 需要对新增的数据再次进行劫持
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inArray = args.slice(2);
      }
      if (inserted.length) {
        // 获取调用者身上的实例方法暂存在_ob属性上
        ob.observeArray(inserted);
      }
      // 数组变化了通知watcher更新视图
      ob.dep.notify();
      return result;
    };
  });

  var id$1 = 0;
  // 每个属性都在存在一个dep 用来记录依赖关联的watcher观察者  每天有渲染的属性不会收集依赖
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++; //属性的dep要收集watcher
      this.subs = []; // 这里存放着当前属性对应的watcher有哪些
    }
    // 暴露dep给watcher监听绑定
    _createClass(Dep, [{
      key: "depend",
      value:
      //静态属性 全局
      // 通知watcher来收集dep实例
      function depend() {
        // 当调用get的时候 watcher就到赋值给了静态属性 将存在的静态方法拿到
        // this.subs.push(Dep.target)// 不需要重复的watcher
        // 让watcher记住dep 把dep传给watcher   Dep.target现在是watcher实例 
        // 使watcher记录dep 
        Dep.target.addDep(this);
      }
      // 被watcher通知后来收集watcher
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        // dep里面收集watcher
        this.subs.push(watcher);
      }
      // 根据收集的依赖进行更新 数据更新 在数据劫持的set中调用 set发生变化调用该方法
    }, {
      key: "notify",
      value: function notify() {
        // 调用里面的watcher来更新 如果没有收集的不会更新视图
        this.subs.forEach(function (watcher) {
          watcher.update();
        }); // 告诉依赖的watcher更新视图
      }
    }]);
    return Dep;
  }(); // 维护一个操作watcher的栈
  _defineProperty(Dep, "target", null);
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  // 每一个属性都有一个Dep实例 （被观察者），watcher就是观察者 （属性变化了会通知观察者去更新）==》观察者模式

  //观察者
  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      //data可能是数组/对象
      this.dep = new Dep(); // 给每一个属性都增加一个dep 解决新增属性时候与数组发生变化的时候更新

      // defineProperty这只能劫持已经存在的属性 （vue中单独处理的$set $delete）
      // 直接给每一个data添加__ob__属性同时也会给对象添加会在 this.walk中被读取所以需要设置不可枚举
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false //将Observer构造实例挂载到data中去 用于操作数组类型的数据劫持
      });
      // data.__ob__ = this//将Observer构造实例挂载到data中去 用于操作数组类型的数据劫持
      if (Array.isArray(data)) {
        // 如果是数组 
        // 需要重写push等方法 需要保留数组原有的方法 同时需要重写部分方法
        data.__proto__ = newArrayProto; //此时 newArrayProto的调用者身上附有该Observer实例的_ob属性,这里同时也给劫持过的数组数据中加上_ob属性
        this.observeArray(data); //数组中放置的是对象或者数组也会被递归劫持 
      } else {
        this.walk(data);
      }
    }
    // 循环对象依次劫持
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // ”重新定义“属性 vue的性能瓶颈  性能差
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
      //对数组中的每一项进行劫持
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observer;
  }();
  /**
   * 不要深层次嵌套,递归影响性能,不存在的属性监控不到 存在的属性要重写方法  vue3中使用proxy 就解决这个问题
   * @param {array} value 
   */
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      // 让每一项数组都进行依赖收集
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }
  function defineReactive(target, key, value) {
    //闭包
    // 判断value是否是对象，如果是则进行递归处理
    var childOb = observe(value); //递归处理   childOb上面就包含一个dep 用来收集属性依赖的
    // 每次劫持属性时都增加一个唯一的dep
    var dep = new Dep(); //dep造成一个新的对象 dep
    Object.defineProperty(target, key, {
      get: function get() {
        //取值的时候 会执行get 在watcher中调用getter取值操作会进入
        // 没有渲染的属性将不会被收集
        if (Dep.target) {
          //代表当前的watcher依赖的该属性
          dep.depend(); //让这个属性的收集器记住当前的watcher
          if (childOb) {
            // 让数组与对象本身也实现依赖收集
            childOb.dep.depend();
            // 如果数组中的元素仍然是数组 递归处理
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        // 对改变的数据进行代理
        observe(newValue);
        value = newValue;
        dep.notify(); //通知dep更新
      }
    });
  }
  // 响应式
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }
    // 如果数组数据被劫持过了就返回
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }
    // 如果一个对象被劫持过了，就不需要载次劫持（要判读是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
    return new Observer(data);
  }

  // 观察者
  var id = 0; // 为了实现组件化开发，进行标识后 实现局部更新

  // 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放在Dep.target上
  // 2）调用_render() 会取值 走到数据劫持中的get中
  var Watcher = /*#__PURE__*/function () {
    //不同组件有不同的watcher 
    function Watcher(vm, _exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options; //渲染watcher
      if (typeof _exprOrFn === 'string') {
        _exprOrFn = function exprOrFn() {
          return vm[_exprOrFn]; //就是侦听的对象
        };
      }

      this.getter = _exprOrFn; //getter 调用后就会发生取值渲染操作
      this.cb = cb; //watch方法代执行的回调
      this.deps = []; //后续实现组件卸载 清理工作 实现计算属性
      this.depsId = new Set();
      // 计算属性用来控制fn的执行
      this.lazy = options ? options === null || options === void 0 ? void 0 : options.lazy : undefined;
      // 用来存储计算属性的缓存值
      this.dirty = this.lazy;
      this.oldVal = this.lazy ? undefined : this.get(); //初次默认调用，被计算属性控制的属性受控制调用
      // this.value = undefined
      this.vm = vm;
      // 判断是不是用户自己定义的watcher 侦听器
      this.user = options ? options.user : undefined;
    }
    // 处理计算属性
    _createClass(Watcher, [{
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); //回去到用户函数的返回值 并且标志为脏
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        // 处理单一的watcher
        // Dep.target = this//把当前的watcher交给dep。target全局唯一的静态属性
        // 处理多个watcher 「渲染wtr与计算属性wtr，」
        pushTarget(this);
        var value = this.getter.call(this.vm); //会去vm上取值 [vm._update(vm._render)]
        // Dep.target = null//dep收集依赖完成 将标识移除
        // 移除调用过的栈中的watcher
        popTarget();
        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        //一个组件对应多个属性 重复的属性也不用记录
        var id = dep.id;
        // 去重后记录dep
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          // 让那个dep记录watcher 由于重复的属性不会进入同一个watcher 所以交给dep也是去重后的watcher
          dep.addSub(this);
        }
      }
      // 计算属性watcher记录其他watcher 依赖 来执行渲染watcher
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) this.deps[i].depend(); // 让计算属性watcher也收集其他watcher
      }
      // 更新视图
    }, {
      key: "update",
      value: function update() {
        // 使用咱脏值来控制计算属性更新
        if (this.lazy) {
          this.dirty = true;
        } else {
          // 异步优化更新视图的方法 
          queueWatcher(this); //b把当前的watcher暂存起来
        }
      }
    }, {
      key: "run",
      value: function run() {
        // 可以拿到新值
        var newVal = this.get();
        if (this.user) {
          console.log(newVal, this.oldVal);
          this.cb.call(this.vm, newVal, this.oldVal);
        }
      }
    }]);
    return Watcher;
  }(); // 刷新更新任务队列要实现异步更新的操作
  var queue = []; //watcher队列
  var has = {}; //去重watcher
  var pending = false; //防抖
  /**
   *  刷新调度队列方法
   */
  function flushSchedulerQueue() {
    // 拷贝queue
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    for (var i = 0; i < flushQueue.length; i++) {
      flushQueue[i].run(); // 在刷新的过程中还有新的watcher 放到queue中
    }
  }
  /**
   * 调度water列队列的water执行更新操作 实现异步更新只触发run函数一次
   * @param {*} watcher 
   */
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      // 不管update执行多少次 但是最终只执行一轮刷新 防抖执行
      if (!pending) {
        // 将带渲染的函数放到下一次宏任务中执行
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  // 用来实现nextTick 都是放在了对列中 遍历队列实现异步一次性全部更新 
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }
  // vue中nextTick 没有直接使用某一个api 而是采用优雅的降级的方式
  // 既有同步又有异步 放到对列中是行为是同步 更新调用flushCallback函数的时候是异步
  // 内部先采用的是promise（ie不兼容） ，不兼容promise采用MutationObserver（h5的api），如果还不兼容 采用ie的专用方案 setImmediate
  // 都不支持，最后是setTimeout
  /**
   * 优雅降级 nextTick实现异步的策略
   * @param {*} flushCallbacks 
   */
  function timeFunc(flushCallbacks) {
    if (Promise) {
      Promise.resolve().then(flushCallbacks);
    } else if (MutationObserver) {
      var observer = new MutationObserver(flushCallbacks);
      var textNode = document.createTextNode(1);
      observer.observe(textNode, {
        characterData: true
      });
      textNode.textContent = 2; //文本变化重新执行
    } else if (setImmediate) {
      setImmediate(flushCallbacks);
    } else {
      setTimeout(flushCallbacks);
    }
  }
  /**
   * 暴露出去nextTick的函数 用户更新调度run函数 也可以暴露出去共用户使用 挂载到了原型$nextTick
   * @param {*} cb 
   */
  function nextTick(cb) {
    // 先内部还是先外部取决于数据的变化
    callbacks.push(cb);
    if (!waiting) {
      timeFunc(flushCallbacks);
      // vue3中  不考虑ie， Promise.resolve().then(flushCallbacks)
      waiting = true;
    }
  }

  // 项目初始化
  function initState(vm) {
    // 获取所有的选项
    var opts = vm.$options;
    if (opts.data) initData(vm);
    if (opts.computed) initComputed(vm);
    if (opts.watch) initWatch(vm);
  }
  // 代理处理vm._data.name的问题 直接使用vm.name 
  // 这里代理了两次
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newVal) {
        vm[target][key] = newVal;
      }
    });
  }
  /**
   * 初始化状态数据
   * @param {*} vm 
   */
  function initData(vm) {
    // 用户定义data 可能是函数/对象 [在vue3中全是函数]
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data; //data是用户的属性
    // 劫持数据，做响应式vue2使用Object.defineProperty
    // vue中定义了监视器模块
    vm._data = data; //把返回的数据挂载到vm中
    observe(data); //同时监听数据的变化vm层
    // 将vm_data 用vm代理
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }
  /**
   * 初始化计算属性
   */
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; //保存Watcher对象 并将计算属性的watcher放在vm身上
    for (var key in computed) {
      var userDef = computed[key];
      // 监控计算属性中的get的变化
      // computed有两种写法
      var fn = typeof userDef === 'function' ? userDef : userDef.get;
      // 如果直接new Watcher就会立刻执行fn 加个配置项不让直接执行
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      // const setter = userDef.set || (() => { })
      defineComputed(vm, key, userDef);
    }
  }
  /**
   * 劫持计算属性
   * @param {*} target 
   * @param {*} key 
   * @param {*} userDef 
   */
  function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    var setter = userDef.set || function () {};
    // 劫持每一个computedWatcher
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }
  /**
   * 创建计算属性getter
   * 计算属性本身根本不会收集依赖 只会让自己的依赖属性去收集依赖
   */
  function createComputedGetter(key) {
    // 监测是否执行getter
    return function () {
      // this指向vm
      var watcher = this._computedWatchers[key];
      // 如果存在dirty属性
      if (watcher.dirty) {
        // 如果是存在计算给的结果 （如果是脏的）就执行用户传入的函数
        watcher.evaluate(); //求值后watcher中的dirty就为脏 不会再次进入
      }

      if (Dep.target) {
        //计算属性出栈后 还好执行渲染watcher应该让watcher里面的属性 也好去收集上一层的watcher
        watcher.depend(); //调用渲染逻辑
      }

      return watcher.value;
    };
  }
  /**
   * 创建初始化watch对象 需要侦听的目标全部创建watcher
   */
  function initWatch(vm) {
    var watch = vm.$options.watch;
    for (var key in watch) {
      // 字符串，函数，数组三种情况
      var hander = watch[key];
      if (Array.isArray(hander)) {
        for (var i = 0; i < hander.length; i++) {
          createWatcher(vm, key, hander[i]);
        }
      } else {
        createWatcher(vm, key, hander);
      }
    }
  }
  /**
   * 创建侦听Watcher
   * @param {*} vm 实例
   * @param {string,function ,object} exprOrFn  侦听的对象 :
   * @param {function } hander 执行的函数
   * @returns 
   */
  function createWatcher(vm, exprOrFn, hander) {
    // hander 三种情况 函数，字符串，对像
    if (typeof hander === 'string') {
      hander = vm[hander];
    }
    // 执行vm.$watch方法
    return vm.$watch(exprOrFn, hander);
  }
  function initStateMixin(Vue) {
    // nextTick混入mixin
    Vue.prototype.$nextTick = nextTick;
    /**
    * watch函数 所有的写法最终都会走向
    * @param {*} exprOrFn 
    * @param {*} cb 
    * @param {*} options 
    */
    Vue.prototype.$watch = function (exprOrFn, cb) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      console.log(exprOrFn, cb, options);
      // 创建侦听watcher
      // 侦听的对象变化了 直接调用cb
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

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
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  // 命名空间标签 aa:aa-xxx
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  // 开始标签-捕获标签名
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  // 结束标签-匹配标签结尾的 </div>
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  // 匹配属性
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  // 匹配标签结束的 >
  var startTagClose = /^\s*(\/?)>/;
  // 匹配 {{ }} 表达式
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  /**
   * html解析生成树结构
   * @param {html结构} html 
   * @returns 
   */
  function parseHTML(html) {
    html = html.trim();
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //创建一个栈
    var currentParent; //指针指向栈中最后一项
    var root;
    // 转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function createASTText(text, parent) {
      return {
        type: TEXT_TYPE,
        text: text,
        parent: parent
      };
    }
    function startLabel(tag, attrs) {
      var node = createASTElement(tag, attrs);
      if (!root) {
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node); //加入栈中
      currentParent = node; // 指针指向栈中最后一个
    }

    function chars(text) {
      text = text.replace(/\s/g, '');
      text && currentParent.children.push(createASTText(text, currentParent));
    }
    function endLabel(tag) {
      stack.pop(); //检验标签是否合法
      currentParent = stack[stack.length - 1]; //指针向前移动一位
    }

    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          //标签名称
          attrs: []
        };
        //前进删除
        advance(start[0].length);
        // 如果不是开始标签的结束 就一直匹配下去
        var attr, end;
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }
        if (end) {
          advance(end[0].length);
        }
        return match;
      }
      return false;
    }
    while (html) {
      // debugger
      // 如果textEnd为0就是开始标签
      // 大于0 就是文本结束的位置
      var textEnd = html.indexOf('<'); //如果索引是0，就说明是个标签 
      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); //开始匹配的结果
        if (startTagMatch) {
          //解析到开始的标签
          startLabel(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          //匹配结束标签
          advance(endTagMatch[0].length);
          endLabel();
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //文本内容
        if (text) {
          chars(text);
          advance(text.length); //解析到的文本
        }
      }

      if (textEnd == -1) {
        break;
      }
    }
    return root;
  }

  /**
   * 处理属性
   * @param {*} attrs 
   * @returns 
   */
  function genProps(attrs) {
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        // 需要将color：red处理成{color:'red'}
        var obj = {};
        attr.value.split(';').forEach(function (e) {
          var _e$split = e.split(':'),
            _e$split2 = _slicedToArray(_e$split, 2),
            key = _e$split2[0],
            value = _e$split2[1];
          obj[key] = value;
        });
        //解析成对象形式后赋值
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  /**
   * 处理子节节点逻辑
   * @param {*} node 
   * @returns 
   */
  function gen(node) {
    // 后代非文本节点
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 文本节点
      // 创建文本节点 填充文本 文本存在纯文本 与da
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        //数据层面
        //_v( _s(name)+'hello'+_s(age))
        var tokens = []; // 储存节点内容
        var match;
        defaultTagRE.lastIndex = 0; //重置正则全局匹配后的位置问题
        var lastIndex = 0; //记录正则匹配位置
        while (match = defaultTagRE.exec(text)) {
          var index = match.index; //正则匹配位置
          if (index > lastIndex) tokens.push(JSON.stringify(text.slice(lastIndex, index))); //将匹配到的文本存储到数组中
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length; //更新匹配位置
        }
        // 最后依然饱含内容
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex))); //将剩余内容存储到数组中
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  /**
   * 处理子代
   * @param {*} ast 
   */
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
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
    var children = genChildren(ast.children);
    var code = " _c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', ",").concat(ast.children.length ? "".concat(children) : "", ")");
    return code;
  }
  /**
   * 对模版进行编译
   * @param {template模版} el 
   */
  function compileToFunction(template) {
    // 1. 就是将template转化为ast语法树
    var ast = parseHTML(template);
    // 2. 生成render方法 render方法执行后的结果就是 虚拟DOM
    // 模版引擎的实现原理就是 with+ new Function
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); //根据代码生成函数
    return render;
  }

  // 构建虚拟节点的方法
  // h(),_c()
  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode({
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children
    });
  }

  //_v()
  function createTextVNode(vm, text) {
    return vnode({
      vm: vm,
      text: text
    });
  }
  /**
   * 虚拟DOM是描述dom元素,可以增加一些自定义属性
   * ast 做的事语法层面的转化 它描述的是语法本身 可以描述js css html等
   */
  function vnode(_ref) {
    var vm = _ref.vm,
      tag = _ref.tag,
      key = _ref.key,
      data = _ref.data,
      children = _ref.children,
      text = _ref.text;
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
      // 插槽 指令等
    };
  }

  /**
   * 比较两个节点
   * @param {*} vnode1 
   * @param {*} vnode2 
   * @returns 
   */
  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  /**
   * 创建真实DOM
   * @param {string} vnode 
   * @returns 
   */
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      key = vnode.key,
      children = vnode.children,
      text = vnode.text;
    if (key) data.key = key;
    if (typeof tag === 'string') {
      // 这里将真实节点与虚拟节点对应起来，
      vnode.el = document.createElement(tag);
      // 元素赋值属性
      patchProps(vnode.el, {}, data);
      if (children) {
        children.forEach(function (child) {
          vnode.el.appendChild(createElm(child));
        });
      }
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  /**
   * 更新属性,给对应的节点添加属性
   */
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // 老的属性中有 新的没有要删除老的
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};
    for (var key in oldStyles) {
      //老的样式中有的 新的没有的 则删除
      if (!(key in newStyles)) {
        el.style[key] = '';
      }
    }
    for (var _key in oldProps) {
      //老的属性中有
      if (!(_key in props)) {
        // 新的没有 删除属性
        el.removeAttribute(_key);
      }
    }
    for (var _key2 in props) {
      //使用新的覆盖老的
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  /**
   * 将获取到的虚拟dom转化成真实dom
   *在vue2/3中 既有初始化功能也有更新功能
   * @param {string} oldVNode 老节点节点
   * @param {string} vnode  新节点
   */
  function patch(oldVNode, vnode) {
    var isRelElement = oldVNode.nodeType; //nodeType原生的方法 判断是不是原生节点 
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
      var elm = oldVNode;
      var parentElm = elm.parentNode;
      //创建dom
      var newElm = createElm(vnode);
      // 想插入新的节点到老的后面 再删除老的
      parentElm.insertBefore(newElm, elm.nextSibling); //nextSibling是指的目标节点的后续节点
      parentElm.removeChild(elm);
      return newElm;
    } else {
      // diff算法

      // console.log(oldVNode, vnode);
      // 1，两个节点不是同一个节点 直接删除老的节点 替换为新的节点
      // 通过一个节点是同一个人节点 （判断节点的tag和节点key） 比较两个节点的属性是否存在差异，（复用老的节点，将差异的属性更新）
      // 3，节点比较完毕后就需要比较两个节点的子节点
      patchVnode(oldVNode, vnode);
    }
  }
  /**
   * 进行diff比较
   * @param {*} oldVNode 
   * @param {*} vnode 
   * @returns 
   */
  function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
      //tag or key 有一个不同时 不是同一个节点
      // 新节点替换老的节点
      var _el = createElm(vnode);
      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    }
    // 文本的情况 tag or key 都相同的情况
    var el = vnode.el = oldVNode.el; //复用老节点的元素
    if (!oldVNode.tag) {
      // 文本
      if (oldVNode.text !== vnode.text) {
        el.textContent = vnode.text; // 新文本覆盖老的文本
      }
    }
    // 是标签 需要比对 标签的属性 
    patchProps(el, oldVNode.data, vnode.data);

    // 比较子节点 
    //  只用一方有子节点 ，双方都有子节点
    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || [];
    if (oldChildren.length && newChildren.length) {
      // 完整的diff算法
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length) {
      // 没有老的只有新的
      mountChildren(el, newChildren);
    } else if (oldChildren.length) {
      el.innerHTML = '';
    }
    return el;
  }
  /**
   * 挂载新节点
   * @param {*} el 
   * @param {*} newChildren 
   */
  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      el.appendChild(createElm(newChildren[i]));
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
    var oldEndIndex = oldChildren.length - 1,
      newEndIndex = newChildren.length - 1;
    // 节点
    var oldStartVnode = oldChildren[0],
      newStartVnode = newChildren[0],
      oldEndVnode = oldChildren[oldEndIndex],
      newEndVnode = newChildren[newEndIndex];
    console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el;
      // 将获取到的虚拟dom转化成真实dom
      // 在vue2/3中 既有初始化功能也有更新功能
      vm.$el = patch(el, vnode);
    };
    // _c('div',{},...children)
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    // _v(text)
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
    Vue.prototype._render = function () {
      // 让with中的this指向vm
      return this.$options.render.call(this); //通过ast语法转译后生成的render方法
    };
  }

  function mountComponent(vm, el) {
    //这里的el是通过querySelector处理过的
    vm.$el = el;
    // 1,  调用render函数 产生虚拟节点 虚拟DOM
    //vm._render()//vm.$options.render() 返回的虚拟节点
    // 2，根据虚拟DOM生成真实的DOM
    // 包裹在watcher者实例中，进行模块开发
    // vm._update(vm._render())
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent);
    // 3，插入到el元素中
  }

  /**
   * vue核心流程
   * 1，创造了响应式
   * 2，模版转成了ast语法树
   * 3，将ast树转化成了render函数
   * 4，后续每次数据更新不再需要重新生成解析ast树 而是只执行render函数
   *      render 函数会产生虚拟节点（使用响应式数据）根据虚拟节点生成真正的DOM节点
   */

  function initMixin(Vue) {
    //给vue实例添加一些方法或函数 -- 可以在实例的时候直接操作对象
    /**
     * 初始化实例 给实例添加用户配置等
     * @param {实例中的属性和方法} options 
     */
    Vue.prototype._init = function (options) {
      // 当使用vue的时候 传递方法 入$nextTick() 等等
      var vm = this;
      vm.$options = options; //将用户的选项传递给实例
      // 初始化状态
      initState(vm);
      // 解析template函数
      if (options.el) {
        // 用户传入了模版
        vm.$mount(options.el); //实现数据的挂载
      }
    };
    /**
     * 解析模版
     * @param {根节点} el 
     */
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      // 判断用户有没有写render函数 与模版
      //. 所以渲染顺序是先看有没有render函数 然后到template 最后到页面中自行查找
      var ops = vm.$options;
      if (!ops.render) {
        var template; //查看有没有写template和模版 没有下颚采用外部
        // 没有写模版 但是写了el
        if (!ops.template && el) {
          //不存在template模版 直接获取
          // 这种具有兼容性问题 
          template = el.outerHTML;
        } else {
          if (el) {
            //存在el模版 采取节点下的模版
            template = ops.template;
          }
        }
        // 写了template 就使用写的模版
        if (template && el) {
          // 这里需要对模版进行编译
          var render = compileToFunction(template);
          ops.render = render; //给实例添加render函数 jsx会被编译成h函数
        }
      }
      // 有render直接取render，没有就使用上层逻辑实行后的render
      // console.log(ops.render);
      mountComponent(vm, el); //.组件的挂载
      //全量的 script标签引用的vue.global.js这个编译过程是在览器运行的
      //runtime「运行时」是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的,在运行时中不能使用template
    };
  }

  // 将所有的方法都耦合在一起
  /**
   * 创建vue构造函数
   * @param {用户的选项} options 
   */
  function Vue(options) {
    // 默认调用init
    this._init(options);
  }
  initMixin(Vue); //扩展了init方法 解析模版生成AST树  生成响应式
  initLifeCycle(Vue); //在data、el、...、methods中扩展扩展是虚拟DOM生成真实DOM
  initStateMixin(Vue); //实现了nextTick 与$watch

  // ++++++++为了方便观察前后的虚拟节点++ 测试使用+++++++
  var render1 = compileToFunction("\n<ul key='ul' id='123' style='color:red'>\n    <li id='a'>a</li>\n    <li id='b'>b</li>\n    <li id='c'>c</li>\n</ul>");
  var vm1 = new Vue({
    data: {
      name: '张三'
    }
  });
  var prevVnode = render1.call(vm1);
  var el = createElm(prevVnode);
  document.body.appendChild(el);
  var render2 = compileToFunction("\n<ul key='ul' id='123' style='color:red;backgroundColor:pink;'>\n    <li id='a'>a</li>\n    <li id='b'>b</li>\n    <li id='c'>c</li>\n    <li id='d'>d</li>\n</ul>");
  var vm2 = new Vue({
    data: {
      name: '李三'
    }
  });
  var nextVnode = render2.call(vm2);

  // let newEl = createElm(nextVnode)
  // 不进行比较直接替换  diff算法是先比较差异后再替换
  /**
  diff 比较是 层层比较，平级比对，深度优先
   *  */
  setTimeout(function () {
    // el.parentNode.replaceChild(newEl, el)
    patch(prevVnode, nextVnode);
  }, 1000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
