//lookupfile找到package.json的依赖后，每个依赖root路径加入口文件，逐个进行rollup打包放到.vite_cache里
// 不总是开启