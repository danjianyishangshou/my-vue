const REJECTED = 'rejected'
const FULFILLED = 'fulfilled'
const PENDING = 'pending'
class MyPromise {
    #state = PENDING
    #result = undefined
    #handers = []
    constructor(executor) {
        const resolve = (data) => {
            this.#changeState(FULFILLED, data)
        }
        const reject = (reason) => {
            this.#changeState(REJECTED, reason)
        }
        // 注意this指向问题
        try {//捕获错误 throw 但是不能捕获异步错误
            // executor(this.resolve.bind(this), this.reject.bind(this))
            executor(resolve, reject)
        } catch (error) {
            // this.reject(error)
            reject(error)
        }
    }
    // resolve(data) {
    //     this.#changeState(FULFILLED, reason)
    // }
    // reject(reason) {
    //     this.#changeState(REJECTED, reason)
    // }
    #changeState(state, result) {
        if (this.#state !== PENDING) return
        this.#state = state
        this.#result = result
        this.#run()
    }
    #run() {
        if (this.#state === PENDING) return
        while (this.#handers.length) {
            const { onFulFilled, onRejected, resolve, reject } = this.#handers.shift()
            if (this.#state === FULFILLED && typeof onFulFilled === 'function') {
                onFulFilled(this.#result)
            } else if (typeof onRejected === 'function') {
                onRejected(this.#result)
            }
        }
    }
    then(onFulFilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            this.#handers.push({
                onFulFilled,
                onRejected,
                resolve,
                reject
            })
            this.#run()

        })
    }
}
// promise不只一个构造函数，或者是个对象，只要包含符合规定的then方法就是Promise