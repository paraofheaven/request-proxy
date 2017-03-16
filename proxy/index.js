"use strict"

//request proxy

import Request from "request";
import _ from "lodash";

function proxy(req, url, callback, params, errCallback){

    function getClientIp(req) {
        const ip = req.headers['ip'] ||
            (req.connection && req.connection.remoteAddress) ||
            (req.socket && req.socket.remoteAddress) ||
            (req.connection && req.connection.socket && req.connection.socket.remoteAddress) || "";
        if (ip.indexOf('::ffff:') > -1) {
            ip = ip.replace(/::ffff:/, '');
        }
        return ip;
    }

    function getParams(){
        let params =this.param;
        if(typeof params !== "string"){
            params = JSON.stringify(this.params);
        }

        if(this.base64){
            if(this.method === "GET"){
                params = "?" + base64.encode(params);
            }else{
                params = base64.encode(params);
            }
        } else {
            if(this.method === "GET"){
                if(this.dataType &&　this.dataType == "base64"){
                    params = "?dataType=base64&data=" +params;
                }else{
                    params = "?" +this.paramsName + "=" +encodeURIComponent(params);
                }
            }else{
                return params;
            }
        }
        return params;
    }

    function renderResponse(data,success){
        let responseData = {
            msg: '',
            errorCode: '',
            success: success
        };
        if(data){
            if(!!(typeof data.success) && !!(typeof data.msg) && !!(typeof data.data)){
                responseData = _.assign(responseData, data.data)
            }else{
                responseData.data = data;
            }
        }
        return responseData;
    }

    let HttpConnection = function(opt){
        this.req = opt.req;
        this.sendCallback = opt.callback || function(data,success){};
        this.sendErrCallback =opt.errCallback || function(data,err){};
    };

    HttpConnection.prototype.send =function(sendData){
        const req=this.req;
        const username = this.req.session.username;
        const ip = req.headers['ip'] || getClientIp(req);
        const defaultData = {
            url: "",
            params: {},
            base64: false,
            method: "GET",
            json: false,
            dataType: "",
            logs: false,
            paramsName: "data"
        };

        _.assign(this, defaultData, sendData);

        const params = getParams.bind(this);

        const responseStart = new Date().getTime();
        if(this.method === "POST"){
            let postConfig ={
                url: this.url,
                headers: {
                    'ip': ip 
                }
            };
            this.json ? postConfig.json =params : postConfig.form ={data:JSON.stringify(params)}
            Request.post(postConfig,responseCallback.bind(this));
        }else{
            let otherConfig ={
                url: this.url + params,
                headers: {
                    'ip': ip
                }
            }
            Request(otherConfig, responseCallback.bind(this));
        }

        function responseCallback(err, res, body){
            if(err){
                this.sendErrCallback.bind(this,body,err);
                if(req.log){
                    req.log.error("ip: " + ip + " with method:" + this.method + " with url:" + this.url + " error=" + err ,"JAVA");
                }
                return console.error("error: " + err);
            }
            let data,
                responseTime = new Date().getTime() - responseStart;

            if(res.statusCode ===200){
                try {
                    if(typeof body === "object"){
                        data = body;
                    } else if(body.match(/^\"{\"/)){
                        data = JSON.parse(body);
                    } else{
                        data =JSON.parse(base64.decode(body))
                    }
                    if(data.success){
                        this.sendCallback.bind(this,data.data, true, data.errorCode || undefined);
                    }else{
                        this.sendCallback.bind(this,data, false, data.errorCode || undefined);
                    }
                    if(req.log){
                        req.log.info("ip: " + ip + " with method:" + this.method + " with url:" + this.url + " 200 responseTimeNJ=" + responseTime  + "ms params=" + JSON.stringify(params) + " data=" + (JSON.stringify(data).length <= 3000 ? JSON.stringify(data) : "data's length is too long!")
                    }
                }catch(e){
                    console.error(e.stack);
                    this.sendErrCallback.bind(this, e, e);

                    if (req.log) {
                        req.log.error("ip: " + ip + " " + this.method + " " + this.url + " 200 responseTimeNJ=" + responseTime  + "ms params=" + JSON.stringify(params) + " error=" + e.stack, "JAVA");
                    }
                    console.error(e, 'url', this.url + params);
                    return ;
                }
            }else{
                this.sendErrCallback.bind(this, e, e);
                if (req.log) {
                    req.log.error(tn_realip + " " + this.method + " " + this.url + " " + res.statusCode + " params= " + JSON.stringify(params), "JAVA");
                }
                console.error('status:', res.statusCode, 'url', this.url + params);
            }
        }
    };

	const hc =new HttpConnection({
		req: req,
		callback: callback,
		errCallback: errCallback
	});
	hc.send(_.assign(params || {} ,{
		url : url
	}));
}

exports.send = proxy;
exports.renderSend = (data)=> proxy.renderResponse(data,true);
exports.renderErrSend = (data)=> proxy.renderResponse(data,false);
