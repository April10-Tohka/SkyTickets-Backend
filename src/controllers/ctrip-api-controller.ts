import { ctrip } from "../utils/request.js";
import { RequestHandler, Request, Response } from "express";

/**
 * fuzzySearch接口可以获取到低价速报的内容，不过接口返回一个对象数组routes，在该数组中，arriveCity属性内包含了展示该卡片的图片地址imageUrl
 *
 * boardListShowSearch接口可以获取到卡片标题的内容，boardItemList可以作为 v-for 遍历的数组,每个卡片标题的都有一个code属性，属性值的末尾刚好是这个卡片标题的图标,
 *     该数字与https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_${i}.png 拼接来请求获取图标,
 *     获取返回的图标与boardItemList拼接，
 *     同时卡片的背景色需要通过get请求https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_bg${i}.jpg 来获取图片，i=1,2,3,
 *     boardItemList数组索引0-7，通过 i=(index%3)+1 来请求获取对应的卡片背景色，最后与boardItemList拼接
 */

/**
 * 获取低价速报的静态资源
 * @param req
 * @param res
 */
export const getBoardListShowSearch: RequestHandler = (
    req: Request,
    res: Response
) => {
    console.log("getBoardListShowSearch调用");
    ctrip({
        url: "/restapi/soa2/15095/boardListShowSearch?_fxpcqlniredt=09031050312106115838&x-traceID=09031050312106115838-1723898045400-4103962",
        method: "post",
        data: {
            dataSearchType: 4,
            requestSource: "online",
            childTravelAffirm: false,
            parentTravelAffirm: false,
            head: {
                cid: "09031050312106115838",
                ctok: "",
                cver: "1.0",
                lang: "01",
                sid: "8888",
                syscode: "999",
                auth: "",
                xsid: "",
                extension: [],
            },
        },
    }).then((data) => {
        let { boardItemList } = data.boardMusterList[0];
        for (let i = 0; i < boardItemList.length; i++) {
            let code = boardItemList[i].code.slice(-2);
            //为每个卡片添加对应的图标地址
            boardItemList[i].imageUrl =
                `https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_${code}.png`;
            boardItemList[i].imageBgUrl =
                `https://webresource.c-ctrip.com/ResH5FlightOnline/flight-home/online/theme_bg${(i % 3) + 1}.jpg`;
        }
        res.status(200).json({
            status: "success",
            code: 200,
            message: "Data fetched successfully",
            data: {
                boardItemList,
            },
            error: null,
            timestamp: new Date().toLocaleString(),
        });
    });
};

export const getSearchBoxRecommend: RequestHandler = (
    req: Request,
    res: Response
) => {
    ctrip({
        url: "/restapi/soa2/17909/SearchBoxRecommend?subEnv=fat110",
        method: "post",
        data: {
            head: {
                cver: "3",
                cid: "",
                extension: [
                    { name: "source", value: "ONLINE" },
                    { name: "sotpGroup", value: "CTrip" },
                    { name: "sotpLocale", value: "zh-CN" },
                ],
            },
            locale: "zh-CN",
            departureCity: "NZH",
            dataType: 1,
        },
    })
        .then((data) => {
            let {
                hotRecommend: { recommendCity },
                indexedCity: { cityList, indexList },
            } = data.recommendGroupList[0];

            const cityPickerTabBar = ["热门"]; //热门城市
            cityPickerTabBar.push(...indexList);

            const cityMap = {}; //按拼音首字母分类后的城市
            for (let i = 0; i < cityList.length; i++) {
                let { firstLetterPy } = cityList[i];
                if (["I", "U", "V"].includes(firstLetterPy)) {
                    continue;
                }
                if (!cityMap[firstLetterPy]) {
                    cityMap[firstLetterPy] = [];
                }
                cityMap[firstLetterPy].push(cityList[i]);
            }

            res.json({
                recommendCity,
                cityMap,
                cityPickerTabBar,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};
