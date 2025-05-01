import fetch from "@system.fetch";
import config from "./config";

export async function getExpressInfo({
    com,
    num,
    phone="",
    from="",
    to="",
    order="desc"
}={}){
    const Header = {
        'Content-Type': 'application/json',
        'Authorization': 'APPCODE ' + config.appCode
    };
    if(com=="shunfeng" | com=="sf"){
        throw new Error("顺丰速运需要填写手机号才可查询")
        return;
    };
    const Data = {
        com: com,
        num: num,
        phone: phone,
        from: from,
        to: to,
        order: order,
        show: "0",
        resultv2: config.resultv2
    };
    const querys = 'param=%7B%22com%22%3A%22{com}%22%2C%22num%22%3A%22{num}%22%2C%22from%22%3A%22{from}%22%2C%22phone%22%3A%22{phone}%22%2C%22to%22%3A%22{to}%22%2C%22resultv2%22%3A{resultv2}%2C%22show%22%3A%22{show}%22%2C%22order%22%3A%22{order}%22%7D';
    querys.replace('{com}', com);
    querys.replace('{num}', num);
    querys.replace('{from}', from);
    querys.replace('{phone}', phone);
    querys.replace('{to}', to);
    querys.replace('{resultv2}', config.resultv2);
    querys.replace('{show}', show);
    querys.replace('{order}', order)
    const url = "https://kdapi.kuaidi100.com/test/poll/channelquery.do?" + querys;
    const result = {};
    await fetch.fetch({
        url: url,
        method: 'POST',
        header: Header,
        data: Data,
        responseType: 'json',
        success: function(response) {
            console.log(`Response code: ${response.code}`);
            console.log(`Response data: ${JSON.stringify(response.data)}`)
            result = response.data;
        },
        fail: function(data, code) {
            console.log(`handling fail, errMsg = ${data}`)
            console.log(`handling fail, errCode = ${code}`)
        }
    })
    return result;
}