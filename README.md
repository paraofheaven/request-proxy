# request-proxy

Simplify usage and proxy for request.js

[![Travis branch](https://img.shields.io/travis/rust-lang/rust/master.svg)](https://github.com/paraofheaven/request-proxy/)
[![GitHub issues](https://img.shields.io/github/issues/paraofheaven/request-proxy.svg)](https://github.com/paraofheaven/request-proxy/issues)
[![npm](https://img.shields.io/npm/dm/localeval.svg)](https://github.com/paraofheaven/request-proxy.git)

- [Install](#install)
- [Usage](#usage)
- [Options](#options)
	- [`params` declaration](#params-declaration)
- [Exports](#exports)
- [Return](#return)
- [Example](#example)
- [License](#license)

## Install

```
npm install request-proxy -S
```

## Usage(es6 with babel)
```js
const proxy = require("request-proxy");
const api="http://myapi.com/getinfo";
const params = {
	params: {},
	method: 'GET',
	json: true
};
const callErrorback =function(data,error){}

exports.getInfo =function(req,res){

	proxy.send(req,api,(data,success)=>{
		if(!success){
			return res.send(proxy.renderErrSend(data.msg))
		}else{
			res.send(proxy.renderSend(data));
		}
	},params,callErrorback);
}

```	
## Options

  option    |    type   |  default                  |Required
  ----------|-----------|---------------------------|--------
  `api`     |   String  | `http://myapi.com/getinfo`| Yes
  `params`  |  Object   |  `{}`                     | No
						   

						   
### Params-declaration

There are six kinds of params for the `params`

- params

  Property  | Type    | Required | Default | Description
  ----------|---------|----------|---------|------------
  params    | Object  | No       | {}      |
  method    | String  | No       | 'GET'   | one of ['GET', 'POST', 'PUT', 'DELETE']
  json      | boolean | No       | false   | request params is or not json 
  base64    | boolean | No       | false   | request params is or not base64 
  datatype  | boolean | No       | ''      |
  paramsName| boolean | No       | 'data'  | request params`s name

e.g.
```js
const params={
	params:{
		id: '110',
		accid: '3005'
	},
	method: 'GET',
	json: true,
	base64: true,
	datatype: 'json',
	paramsName: 'data'
}
```

## Exports

- proxy.send

- proxy.renderSend

```js
//usage:


```

- proxy.renderErrSend


## Return

A plain Object like this :

```js
{
  msg: "",
  success: true,
  errorCode: "",
  data:{
  // xxx
  }
}
// or
{
  msg: "accid is wrong",
  success: false,
  errorCode: "30001",
  data:{}
}
```

## Example 

Please see [Example](example/).

## License

The [MIT License](LICENSE)




 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 

