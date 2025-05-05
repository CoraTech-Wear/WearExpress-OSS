import fetch from "@system.fetch";
import config from "./config";
import prompt from "@system.prompt";
import stateref from './refs';
import storage from '@system.storage';

async function getExpressInfo({
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
    if(com === "shunfeng" || com === "sf"){
        if(phone==""){
            throw new Error("顺丰速运需要填写手机号才可查询")
        }
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
    const querys1 = `param=%7B%22com%22%3A%22${com}%22%2C%22num%22%3A%22${num}%22%2C%22from%22%3A%22${from}%22%2C%22phone%22%3A%22${phone}%22%2C%22to%22%3A%22${to}%22%2C%22resultv2%22%3A${resultv2}%2C%22show%22%3A%22${show}%22%2C%22order%22%3A%22${order}%22%7D`;
    const querys = 'param=%7B%22com%22%3A%22{com}%22%2C%22num%22%3A%22{num}%22%2C%22from%22%3A%22{from}%22%2C%22phone%22%3A%22{phone}%22%2C%22to%22%3A%22{to}%22%2C%22resultv2%22%3A{resultv2}%2C%22show%22%3A%22{show}%22%2C%22order%22%3A%22{order}%22%7D';
    let queryStr = querys
    .replace('{com}', com)
    .replace('{num}', num)
    .replace('{from}', from)
    .replace('{phone}', phone)
    .replace('{to}', to)
    .replace('{resultv2}', config.resultv2)
    .replace('{show}', "0")
    .replace('{order}', order);
    const url = "https://kdapi.kuaidi100.com/test/poll/channelquery.do?" + queryStr;
    console.log('快递查询请求参数:', { com, num, phone });
    console.log('完整请求URL:', url);
    return new Promise((resolve, reject) => {
        fetch.fetch({
            url: url,
            method: 'POST',
            header: Header,
            data: Data,
            responseType: 'json',
            success: (response) => {
                console.log(`Response code: ${response.code}`);
                if (response.code === 200) {
                    console.log('快递查询响应数据:', response.data);
                    prompt.showToast({
                        message: '查询成功'+response.data.state,
                        duration: 1000
                    });
                    resolve(response.data);
                } else {
                    reject(new Error(`请求失败: ${response.data}`));
                }
            },
            fail: (data, code) => {
                console.log(`handling fail, errMsg = ${data}`);
                reject(new Error(`网络错误: ${code}`));
            }
        });
    });
}

export class ExpressInfo{
    constructor({com="", num, phone="", from="", to="", order="desc"}){
        this.com = com;
        this.num = num;
        this.phone = phone;
        this.from = from;
        this.to = to;
        this.order = order;
        this.data = null;
    };
    async getExpressInfo(){
        this.data =  await getExpressInfo({
            com: this.com, 
            num: this.num, 
            phone: this.phone, 
            from: this.from, 
            to: this.to, 
            order: this.order
        });
        return true;
    };
    getExpressComName(){
        return stateref.expressCom[this.data.com];
    };
    isExpressChecked(){
        return this.data.isCheck === "1";
    };
    getExpressNum(){
        return this.data.nu;
    };
    getExpressState(){
        return stateref.expressState[this.data.state];
    };
    getLogisticsTracking(){
        return this.data.data;
    }
}

export class QueryHistory{
    constructor(){
        this.historyData = [];
    };
    loadHistoryData(){
        storage.get({
            key: 'historyData',
            default: '[]',
            success: (data) => {
                this.historyData = JSON.parse(data);
            },
            fail: (data, code) => {
                console.log(`handling fail, errMsg = ${data}`);
                prompt.showToast({
                    message: '读取历史查询记录失败'+data+code,
                    duration: 1000
                })
            }
        });
    };
    saveHistoryData(){
        prompt.showToast({
            message: JSON.stringify(this.historyData),
            duration: 2000
        })
        storage.set({
            key: 'historyData',
            value: JSON.stringify(this.historyData),
            success: () => {
                console.log('保存成功');
            },
            fail: (data, code) => {
                prompt.showToast({
                    message: '保存历史查询记录失败,'+data+code,
                    duration: 1000
                })
            }
        })
    };
    addHistoryData ({num}){
        this.historyData.unshift(num);
        this.saveHistoryData();
    };
    getHistoryData(){
        return this.historyData;
    };
}