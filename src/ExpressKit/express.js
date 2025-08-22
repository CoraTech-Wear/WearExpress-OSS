/*
    Express.js API
    Copyright (C) 2024-2025, CoraTech Workspace

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import fetch from "@system.fetch";
import config from "./config";
import prompt from "@system.prompt";
import refs from './refs';
import storage from '../common/storage';
import crypto from "@system.crypto";


export async function getExpressInfo({
    com="",
    num,
    phone="",
    from="",
    to="",
    order="desc"
}={}){
    const Header = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    if(com === "shunfeng" || com === "sf"){
        if(phone==""){
            throw new Error("顺丰速运需要填写手机号才可查询")
        }
    };
    var APIConfig = "";
    var APIConfigData = {};

    storage.get({
        key: 'APIConfig',
        default: '',
        success: (data) => {
            console.log('APIConfig:', data);
            APIConfig = data;
        },
        fail: (data, code) => {
            console.log(`handling fail, errMsg = ${data}`);
        }
    })
    APIConfigData["customer"] = APIConfig.split(" ")[0];
    APIConfigData["key"] = APIConfig.split(" ")[1];

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
    const verify = crypto.hashDigest({
        data: JSON.stringify(Data)+APIConfigData.customer+APIConfigData.key,
        algo: 'md5'
    })
    const Data_ = {
        customer: APIConfigData["customer"],
        sign: verify,
        params: Data
    }
    const url = "https://poll.kuaidi100.com/poll/query.do";
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
    constructor(data){
        this.data = data;
        console.log(data)
    };
    getExpressComName(){
        return refs.expressCom[this.data.com];
    };
    isExpressChecked(){
        return this.data.isCheck === "1";
    };
    getExpressNum(){
        return this.data.nu;
    };
    getExpressState(){
        return refs.expressState[this.data.state];
    };
    getLogisticsTracking(){
        return this.data.data;
    };
    getArrivalTime(){
        return this.data.remainTime;
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