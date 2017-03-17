'use strict';

const path =require('path');
const express =require('express');
const app = express();
const proxy =require('../index');

const api = "https://api.github.com/repos/typecho-fans/plugins/contents/";

app.get('/',(req,res)=>{
	proxy.send(req,api,(data,success)=>{
		if(!success){
			return res.send(proxy.renderErrSend(data.msg));
		}else{
			return res.send(proxy.renderSend(data));
		}
	})
})

app.listen(4000);