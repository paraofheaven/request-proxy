"use strict"

// 通用数据获取proxy

import Request from "request";
import _ from "lodash";

function getClientIp(req) {
    var ip = req.headers['ip'] ||
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
			this.params = "?" + base64.encode(params);
		}else{
			this.params = base64.encode(params);
		}
	} else {
		if(this.method === "GET"){
			if(this.dataType &&　this.dataType == "base64"){
				this.params = "?dataType=base64&data=" +params;
			}else{
				this.params = "?" +this.paramsName + "=" +encodeURIComponent(params);
			}
		}else{
			return this.params;
		}
	}
	return this.params;
}

function render(data,hasErr){
	let responseData = {
		msg: '',
		errorCode: ''
	};
	hasErr ? responseData.success = false : responseData.success =true;
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
};

HttpConnection.prototype.sendCallback = function(data,success){};
HttpConnection.prototype.sendErrCallback =function(data,err){};

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
    const responseStart = new Date().getTime();

    _.assign(this, defaultData, sendData);

    const params = getParams.bind(this);

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
}

function proxyFn(req, url, callback, params, errCallback){
	const hc =new HttpConnection({
		req: req
	});
	hc.send(_.assign(params || {} ,{
		url : url
	}));
	hc.sendCallback =callback;
	hc.sendErrCallback =errCallback;
}

exports.send = proxyFn;
exports.renderSend = (data)=> render(data);
exports.renderErrSend = (data)=> render(data,true);
