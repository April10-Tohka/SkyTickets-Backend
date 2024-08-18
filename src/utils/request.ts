import axios from "axios";

type ctripResponse = Array<any> | { [key: string]: any };
// 这段类型定义代码是TypeScript中的类型别名（Type Alias）示例，用于定义一个名为ApiResponse的类型。这个类型可以表示两种结构之一：
//
// 数组 (Array<any>): 这意味着ApiResponse可以是一个数组，数组中的元素可以是任何类型（any类型表示可以是任意类型）。这种类型通常用于表示一系列具有相同或不同数据结构的对象，或者简单数据类型的集合，如数字、字符串等。
// 对象字面量 ({ [key: string]: any }): 这部分表示ApiResponse也可以是一个对象，这个对象的键（key）是字符串类型，而值（value）可以是任意类型（any）。这种类型通常用于表示键值对的集合，其中键是字符串，而值可以是任何类型的数据。这种结构非常适合于表示API响应中常见的嵌套对象或数据字典。
export const ctrip = axios.create({
    baseURL: "https://m.ctrip.com",
    timeout: 5000,
    headers: {
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        "Content-Type": "application/json",
        Accept: "*/*",
        Host: "m.ctrip.com",
        Connection: "keep-alive",
    },
});

// 添加请求拦截器
ctrip.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        console.log("在发送请求之前做些什么");
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        console.log("对请求错误做些什么");
        return Promise.reject(error);
    }
);

// 添加响应拦截器
ctrip.interceptors.response.use(
    function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么
        console.log("对响应数据做点什么");
        return response.data;
    },
    function (error) {
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        console.log("对响应错误做点什么");
        return Promise.reject(error);
    }
);
