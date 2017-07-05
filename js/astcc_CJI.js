/*
 * astcc_CJI(astercc client javascript interface)
 * Version 1.0 基于jquery(http://code.jquery.com/jquery-1.4.2.min.js)
 *
 * Copyright (c) 2007-2010 Inc.All Rights Reserved
 *
 * @Document:
 * http://cn.astercc.org
 * http://wiki.astercc.org/doku.php
 *
 * @Contact:
 * asterCC <support@astercc.org>
 *
 */


if(typeof(astercc_ip) != 'undefined'){
	if(astercc_ip == ''){
		alert("Please defined astercc_ip");
	}
}else{
	alert("Please defined astercc_ip");
}
var astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

//登录
function loginCJI(orgidentity,usertype,user,pwdtype,password,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    
	var url = astercc_cip + '/login/login/';
	$.post(url,{
		'data[Account][team]':'astercc',
		'data[Account][type]': 'user',
		'data[Account][username]': user,
		'data[Account][password]': password,
		'data[Account][language]':'en',
		'rememberme':''
	},function(result) {
		console.log(result);
		var resultJson = $.parseJSON(result);
		
		try{
			if(resultJson != null &&  callbackFuc != ''){
				callbackFuc(resultJson);
			}
		}catch(e){
			//alert('loginCJI error!');
		}
    });
}

//登出
function logoutCJI(orgidentity,usertype,user,pwdtype,password,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/logoutCJI?callback=?",{
		usertype:usertype,
		user:user,
		orgidentity:orgidentity,
		pwdtype:pwdtype,
		password:password
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('logoutCJI error!');
		}
    });
}


//队列接口(分机示忙，闲)
function queueActionCJI(type,usertype,user,orgidentity,list,pwdtype,password,deviceexten,pushevent,callbackFuc,intparam){
	astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'QUEUE',
			type:type,
			usertype:usertype,
			user:user,
			orgidentity:orgidentity,
			list:list,
			pwdtype:pwdtype,
			password:password,
			deviceexten:deviceexten,
			pushevent:pushevent
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
}


//(暂停/继续)服务
function queuePauseCJI(type,usertype,user,orgidentity,pwdtype,password,pause_reason,pushevent,callbackFuc,dnd,intparam){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'QUEUEPAUSE',
			'type':type,
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity,
			'pause_reason':pause_reason,
			'pwdtype':pwdtype,
			'password':password,
			'pushevent':pushevent,
			'dnd':dnd
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
}


//切换事后模式
function acwActionCJI(type,usertype,user,orgidentity,pwdtype,password,agent_group_id,pushevent,callbackFuc){
	astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'ACW',
			'type':type,
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity,
			'agent_group_id':agent_group_id,
			'pwdtype':pwdtype,
			'password':password,
            'pushevent':pushevent
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
	
}


//结束事后
function acwOffCJI(usertype,user,orgidentity,pwdtype,password,pushevent,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'ACWOFF',
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity,
			'pwdtype':pwdtype,
			'password':password,
            'pushevent': pushevent
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
}


//切换工作模式
function workwayActionCJI(status,usertype,user,orgidentity,pwdtype,password,agent_group_id,pushevent,callbackFuc){
	astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'WORKWAY',
			'status':status,
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity,
			'pwdtype':pwdtype,
			'password':password,
			'agent_group_id':agent_group_id,
            'pushevent':pushevent
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
	
}


//呼叫接口
function makeCallCJI(targetdn, targettype, agentgroupid, usertype, user, orgidentity,pwdtype, password, modeltype, model_id, userdata, callbackFuc, agentexten,callerid,callername,trunkidentity,cidtype, ignorerepeat){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'MAKECALL',
			'targetdn':targetdn,
			'targettype':targettype,
			'agentgroupid':agentgroupid,
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity,
			'pwdtype':pwdtype,
			'password':password,
			'modeltype':modeltype,
			'model_id':model_id,
			'userdata':userdata,
			'agentexten':agentexten,
			'callerid':callerid,
			'callername':callername,
			'trunkidentity':trunkidentity,
			'cidtype':cidtype
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
}

//咨询接口
function consultCJI(targetdn, agentgroupid, consulttype, pwdtype,password,usertype,user,orgidentity,callbackFuc){
   
	astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'CONSULT',
			targetdn:targetdn,
			agentgroupid:agentgroupid,
			consulttype:consulttype,
			pwdtype:pwdtype,
			password:password,
			usertype:usertype,
			user:user,
			orgidentity:orgidentity
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);


}

//转接接口
function transferCJI(pwdtype,password,usertype,user,orgidentity,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'TRANSFER',
			'pwdtype':pwdtype,
			'password':password,
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
}

//接回接口
function callReturnCJI(pwdtype,password,usertype,user,orgidentity,callbackFuc){
   astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'CALLRETURN',
			'pwdtype':pwdtype,
			'password':password,
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);
}

//会议接口
function conferenceCJI(pwdtype,password,usertype,user,orgidentity,callbackFuc){
	astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'CONFERENCE',
			'pwdtype':pwdtype,
			'password':password,
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('queuePauseCJI error!');
				}
			}
    	}
	);


}

//挂断接口
function hangupCJI(uniqueid,targetagent,target,pwdtype,password,usertype,user,orgidentity,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/hangupCJI?callback=?",{
		uniqueid:uniqueid,
		targetagent:targetagent,
		target:target,
		pwdtype:pwdtype,
		password:password,
		usertype:usertype,
		user:user,
		orgidentity:orgidentity
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('hangupCJI error!');
		}
    });
}


//强插接口
function intrudeCJI(target, phonenumber, pwdtype, password, usertype, user, orgidentity, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/intrudeCJI?callback=?",{
		target:target,
		phonenumber:phonenumber,
		pwdtype:pwdtype,
		password:password,
		usertype:usertype,
		user:user,
		orgidentity:orgidentity
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('intrudeCJI error!');
		}
    });
}

//监听接口
function silentMonitorCJI(target, phonenumber, pwdtype, password, usertype, user, orgidentity, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/silentMonitorCJI?callback=?",{
		target:target,
		phonenumber:phonenumber,
		pwdtype:pwdtype,
		password:password,
		usertype:usertype,
		user:user,
		orgidentity:orgidentity
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('silentMonitorCJI error!');
		}
    });
}

//强拆接口
function forcedReleaseCJI(target, phonenumber, pwdtype, password, usertype, user, orgidentity, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/forcedReleaseCJI?callback=?",{
		target:target,
		phonenumber:phonenumber,
		pwdtype:pwdtype,
		password:password,
		usertype:usertype,
		user:user,
		orgidentity:orgidentity
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('forcedReleaseCJI error!');
		}
    });
}

//密语接口
function whisperCJI(target, phonenumber, pwdtype, password, usertype, user, orgidentity, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/whisperCJI?callback=?",{
		target:target,
		phonenumber:phonenumber,
		pwdtype:pwdtype,
		password:password,
		usertype:usertype,
		user:user,
		orgidentity:orgidentity
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('whisperCJI error!');
		}
    });
}

//通话暂停接口
function holdCJI(silence,orgidentity, usertype, user, pwdtype,password,callbackFuc){
   astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'Hold',
			'silence':silence,
			'orgidentity':orgidentity,
			'usertype':usertype,
			'user':user,
			'pwdtype':pwdtype,
			'password':password
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('holdCJI error!');
				}
			}
    	}
	);
	
}

//通话继续接口
function resumeCJI(orgidentity, usertype, user, pwdtype, password, callbackFuc){
   astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'Resume',
			'orgidentity':orgidentity,
			'usertype':usertype,
			'user':user,
			'pwdtype':pwdtype,
			'password':password
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('resumeCJI error!');
				}
			}
    	}
	);    
}

//获取团队坐席状态
function teamStatusCJI(orgidentity, usertype, user, pwdtype, password, status, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/teamStatusCJI?callback=?",{
		status:status,
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('teamStatusCJI error!');
		}
    });
}

//获取坐席组状态
function agentgroupStatusCJI(orgidentity, usertype, user, pwdtype, password, agent_group_id, status, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/agentgroupStatusCJI?callback=?",{
		agent_group_id:agent_group_id,
		status:status,
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('agentgroupStatusCJI error!');
		}
    });
}

//获取坐席状态接口
function agentStatusCJI(orgidentity, usertype, user, pwdtype,password,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/agentStatusCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('agentStatusCJI error!');
		}
    });
}

//预拨号接口
function dialerListCJI(orgidentity, usertype, user, pwdtype, password, campaignid, phonenum, priority, dialtime, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/dialerListCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password,
		campaignid:campaignid,
		phonenum:phonenum,
		priority:priority,
		dialtime:dialtime
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('agentStatusCJI error!');
		}
    });
}

//数据导入接口
function importCJI(orgidentity, usertype, user, pwdtype, password, modeltype, model_id, source, context, source_user, source_pwd, exetime, delrow, phone_field, priority_field, dialtime_field, emptyagent, resetstatus, dupway, dupdiallist, changepackage, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/importCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password,
		modeltype:modeltype,
		model_id:model_id,
		source:source,
		context:context,
		source_user:source_user,
		source_pwd:source_pwd,
		exetime:exetime,
		delrow:delrow,
		phone_field:phone_field,
		priority_field:priority_field,
		dialtime_field:dialtime_field,
		emptyagent:emptyagent,
		resetstatus:resetstatus,
		dupway:dupway,
		dupdiallist:dupdiallist,
		changepackage:changepackage
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('agentStatusCJI error!');
		}
    });
}

//多段录音控制接口（以坐席为对象，当action为start时，以该时间点为起始，录制独立录音文件，action为stop时录音停止）
function monitorCtrlCJI(action,usertype,user,orgidentity,pwdtype,password,pushevent,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    var pjson = action;
    if (typeof(action) != 'object') {
        pjson = {
		    "action": action,
		    "usertype": usertype,
		    "user": user,
		    "orgidentity": orgidentity,
		    "pwdtype": pwdtype,
		    "password": password,
		    "pushevent": pushevent
	    };
    } else {
        if (typeof(pjson.callbackFuc) != 'undefined' && pjson.callbackFuc != '') {
            callbackFuc = pjson.callbackFuc;
            delete pjson.callbackFuc;
        }
    }
    $.getJSON(astercc_cip+"/setevent/monitorCtrlCJI?callback=?", pjson, function (json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('queuePauseCJI error!');
		}
    });
}


//获取录音存放地址
function getMonitorCJI(sessionid, calldate, callbackFuc, mp3,filename){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/getMonitorCJI?callback=?",{
		sessionid:sessionid,
		calldate:calldate,
		mp3:mp3,
		filename:filename
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('getMonitorCJI error!');
		}
    });
}

//队列中客户数量
function queueCustomerNumCJI(orgidentity, queuenumber, prio, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/queueCustomerNumCJI?callback=?",{
		orgidentity:orgidentity,
		queuenumber:queuenumber,
		prio:prio
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('queueCustomerNumCJI error!');
		}
    });
}

//获取单一坐席实时数据
function agentRealtimeCJI(orgidentity,usertype,user,pwdtype,password,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/agentRealtimeCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('agentRealtimeCJI error!');
		}
    });
}

//获取单一坐席今日在坐席组中的统计数据
function agentStatisticDayCJI(orgidentity,usertype,user,pwdtype,password,agent_group_id,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/agentStatisticDayCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password,
        agent_group_id:agent_group_id
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('agentStatisticDayCJI error!');
		}
    });
}

//发送DTMF
function dtmfCJI(orgidentity,usertype,user,pwdtype,password,dtmf,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/dtmfCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password,
		dtmf:dtmf
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('dtmfCJI error!');
		}
    });
}

//设置随路数据
function setvarCJI(orgidentity,usertype,user,pwdtype,password,varname,varvalue,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/setvarCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password,
		varname:varname,
		varvalue:varvalue
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('setvarCJI error!');
		}
    });
}

//坐席转IVR
function agenttoivrCJI(orgidentity,usertype,user,pwdtype,password,ivrexten,ivrflow,transfer,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/agenttoivrCJI?callback=?",{
		orgidentity:orgidentity,
		usertype:usertype,
		user:user,
		pwdtype:pwdtype,
		password:password,
		ivrexten:ivrexten,
		ivrflow:ivrflow,
		transfer:transfer
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('setvarCJI error!');
		}
    });
}


//双呼拨号
function backcallCJI(orgidentity,exten,targetdn,callerid,user,password,pwdtype,userdata,callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/backcallCJI?callback=?",{
		orgidentity:orgidentity,
		exten:exten,
		targetdn:targetdn,
		callerid:callerid,
		user:user,
		password:password,
		pwdtype:pwdtype,
        userdata:userdata
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('backcallCJI error!');
		}
    });
}


//Q房双呼拨号
function qbackcallCJI(orgidentity, exten, targetdn, icallerid, xcallerid, user, password, pwdtype, userdata, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/qbackcallCJI?callback=?",{
		orgidentity:orgidentity,
		exten:exten,
		targetdn:targetdn,
		icallerid:icallerid,
		xcallerid:xcallerid,
		user:user,
		password:password,
		pwdtype:pwdtype,
        userdata:userdata
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('backcallCJI error!');
		}
    });
}


//设置分机
function setdeviceCJI(orgidentity, exten, user, pwdtype, password, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/setdeviceCJI?callback=?",{
		orgidentity:orgidentity,
		exten:exten,
		user:user,
		pwdtype:pwdtype,
		password:password
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('setdeviceCJI error!');
		}
    });
}



//yealink 答应接口
function yealinkAnswerCJI(orgidentity, type, target, phoneuser, phonepwd, callbackFuc){
    astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    $.getJSON(astercc_cip+"/setevent/yealinkAnswerCJI?callback=?",{
		orgidentity:orgidentity,
		type:type,
		target:target,
		phoneuser:phoneuser,
		phonepwd:phonepwd
	},function(json) {
		try{
			if(typeof(callbackFuc) != 'undefined' && callbackFuc != ''){
				callbackFuc(json);
			}
		}catch(e){
			//alert('yealinkAnswerCJI error!');
		}
    });
}


function getMyInfo(user,password,pwdtype,callbackFuc){
	astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;
    
	var url = astercc_cip + '/asterccinterfaces';
	$.get(url,{
		'EVENT':'MyInfo',
		'user': user,
		'password': password,
		'pwdtype': pwdtype

	},function(result) {
		var resultJson = $.parseJSON(result);
		
		try{
			if(resultJson != null &&  callbackFuc != ''){
				callbackFuc(resultJson);
			}
		}catch(e){
			//alert('loginCJI error!');
		}
    });
}


//设置默认坐席组
function setDefaultGroupCJI(usertype,user,orgidentity,pwdtype,password,agent_group_id,callbackFuc){
	astercc_cip = (typeof(astercc_is_ssl) != 'undefined' && astercc_is_ssl?"https":"http")+"://"+astercc_ip;

	var url = astercc_cip + '/asterccinterfaces';
    $.post(url, 
		{
			'EVENT':'DefaultGroup',
			'usertype':usertype,
			'user':user,
			'orgidentity':orgidentity,
			'pwdtype':pwdtype,
			'password':password,
			'agent_group_id':agent_group_id
		}, 
		function (result) {
			var resultSplitAry = result.split('|Retuen|');

			if( resultSplitAry.length == 3 ){
				var code = resultSplitAry[1];
				var message = resultSplitAry[2];
				var resultJson = {
					code: code,
					message:message
				};
				try{
					if(callbackFuc != null ){
						callbackFuc(resultJson);
					}
				}catch(e){
					//alert('setDefaultGroupCJI error!');
				}
			}
    	}
	);
}
