/**
 * 将时间格式化为 小时:分
 * @param time 时间
 * @returns {string}  小时:分
 */
export function formatTime(time)
{
    return time.substring(0,5);
}

/**
 *
 * @param utcDate utc时间
 * @returns {string} 北京时间 2024-04-09
 */
export function getLocalDate(utcDate)
{
    let localDate= new Date(new Date(utcDate).getTime() + (8 * 60 * 60 * 1000));
    let year = localDate.getFullYear();
    let month = (localDate.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要加1，然后确保两位数字
    let day = localDate.getDate().toString().padStart(2, '0'); // 确保两位数字
    // 拼接成 'YYYY-MM-DD' 格式
    return year + '-' + month + '-' + day;
}

/**
 * 生成本地时间的小时和分钟
 * @returns {string} 小时:分钟
 */
export  function  generateBookTime()
{
    let currentDate=new Date();
    let hour=currentDate.getHours().toString().padStart(2, '0');
    let minute=currentDate.getMinutes().toString().padStart(2, '0');
    return hour+":"+minute;
}

