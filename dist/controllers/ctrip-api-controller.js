"use strict";
// import axios from "axios";
/**
 * fuzzySearch接口可以获取到低价速报的内容，不过接口返回一个对象数组routes，在该数组中，arriveCity属性内包含了展示该卡片的图片地址imageUrl
 *
 * boardListShowSearch接口可以获取到卡片标题的内容，boardItemList可以作为 v-for 遍历的数组,每个卡片标题的都有一个code属性，属性值的末尾刚好是这个卡片标题的图标,
 *     该数字与https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_${i}.png 拼接来请求获取图标,
 *     获取返回的图标与boardItemList拼接，
 *     同时卡片的背景色需要通过get请求https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_bg${i}.jpg 来获取图片，i=1,2,3,
 *     boardItemList数组索引0-7，通过 i=(index%3)+1 来请求获取对应的卡片背景色，最后与boardItemList拼接
 */
let a = 10;
console.log(a);
