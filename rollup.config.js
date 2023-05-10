import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
export default {
    // 入口
    input: './src/index.js',
    // 出口
    output: {
        // 出口目录
        file: './dist/vue.js',
        // 打包名称
        name: 'Vue',// 全局实例Vue
        // esm es6模块 commonjs模块 life自执行函数 umd
        format: 'umd',
        sourcemap: true//调试文件
    },
    plugins: [
        babel({
            exclude: 'node_modules/**' // 排除里面所有文件
            // 建设babelrc文件
        }),
        resolve()
    ]
}