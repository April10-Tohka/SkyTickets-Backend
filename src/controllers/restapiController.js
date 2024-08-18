import axios from "axios";


/**
 * 获取城市
 * @param req
 * @param res
 */
export function getSearchBoxRecommend(req,res)
{
    console.log("访问路径/searchbox-recommend");
    const data = JSON.stringify({
        "head": {
            "cver": "3",
            "cid": "",
            "extension": [
                {
                    "name": "source",
                    "value": "ONLINE"
                },
                {
                    "name": "sotpGroup",
                    "value": "CTrip"
                },
                {
                    "name": "sotpLocale",
                    "value": "zh-CN"
                }
            ]
        },
        "locale": "zh-CN",
        "departureCity": "SHA",
        "dataType": 1
    });

    const config = {
        method: 'post',
        url: 'https://m.ctrip.com/restapi/soa2/17909/SearchBoxRecommend?subEnv=fat110',
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Host': 'm.ctrip.com',
            'Connection': 'keep-alive'
        },
        data: data
    };

    axios(config)
        .then((response)=> {
            let {hotRecommend:{recommendCity},indexedCity:{cityList,indexList}} =response.data.recommendGroupList[0];

            const cityPickerTabBar=["热门"];//热门城市
            cityPickerTabBar.push(...indexList);

            const cityMap={};//按拼音首字母分类后的城市
            for(let i=0;i<cityList.length;i++)
            {
                let {firstLetterPy}=cityList[i];
                if(["I","U","V"].includes(firstLetterPy))
                {
                    continue;
                }
                if(!cityMap[firstLetterPy])
                {
                    cityMap[firstLetterPy]=[];
                }
                cityMap[firstLetterPy].push(cityList[i]);
            }

            res.json({
                recommendCity,
                cityMap,
                cityPickerTabBar
            })
        })
        .catch(err=> {
            console.log(err);
        });
}
