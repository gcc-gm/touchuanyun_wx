/**
 * 转换时间格式
 */
const getTime = function (time, format) {
    var time = time;
    if (time === undefined) {
        time = Math.round(new Date() / 1000);
    }
    var date = new Date(time * 1000);
    if (format === undefined) {
        format = date;
        date = new Date();
    }
    var map = {
        "y": date.getFullYear(),//年
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(), //分
        "s": date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        }
        return all;
    });
    return format;
}
export {
    getTime
}
