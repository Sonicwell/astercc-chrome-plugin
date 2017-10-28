var agentPullRunning = false;
var URL_BASE = '';
var baseParam = null;
var agentPullLastModified = null;
var agentPullEtag = null;
var onEventFun = null;
var agentPullReq = null;


//开启轮询
var startAgentPull = function(_onEventFun){
    agentPullRunning = true;
    onEventFun = _onEventFun;
    baseParam = JSON.parse(localStorage.getItem('baseParam'));
   
    URL_BASE = baseParam.serverUrl;
    if( URL_BASE.indexOf('http://') != -1 ){
        astercc_ip = URL_BASE.split('http://')[1];
    }else if( URL_BASE.indexOf('https://') != -1 ){
        astercc_is_ssl = true;
        astercc_ip = URL_BASE.split('https://')[1];
    }else{
        astercc_ip = URL_BASE;
        URL_BASE = 'http://' + URL_BASE;
    }

    getCcdate(function(result){
        if( result != null && result.ccdate != null ){
            agentPullEtag = 0 ;
            agentPullLastModified = result.ccdate;
            callAgentPull();
        }
    });
}


//获取服务器时间
var getCcdate = function(cb){
    var url = URL_BASE + '/getccdate/getccdate';
    $.get(
        url,
        function(result){
            if( cb ){
                cb(result);
            }
        },
        'json'
    );
};


//轮询
var callAgentPull = function(){
    if (agentPullRunning == true) {
        var url = URL_BASE + '/agentindesks/agentpull/' + baseParam.orgidentity + '-' + baseParam.agentno + '-' + baseParam.agentpassword + '?_=' + new Date().getTime();

        agentPullReq = $.ajax({
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-None-Match", agentPullEtag);
                xhr.setRequestHeader("If-Modified-Since", agentPullLastModified);
            },
            url: url,
            dataType: 'text',
            type: 'get',
            cache: false,
            success: function (data, textStatus, xhr) {
                agentPullEtag = xhr.getResponseHeader('Etag');
                agentPullLastModified = xhr.getResponseHeader('Last-Modified');

                if( xhr.status == 200 ){
                    if( data != null ){
                        var dataAry = data.split("\r\n");
                        for (var datai=0; datai<dataAry.length; datai++) {
                            if (dataAry[datai] != '') {
                                var json = $.parseJSON(dataAry[datai].replace(/'/g,'"'));
                                if (onEventFun != null) {
                                    onEventFun(json);
                                }
                            }
                        }

                    }
                }
                
                callAgentPull(agentPullEtag, agentPullLastModified);
            },
            error: function (xhr, textStatus, errorThrown) {
                agentPullEtag = xhr.getResponseHeader('Etag');
                agentPullLastModified = xhr.getResponseHeader('Last-Modified');
                callAgentPull(agentPullEtag, agentPullLastModified);
            }
        });
    }
};


//终止轮询
var stopAgentPull = function(){
    agentPullRunning = false;
    if (agentPullReq != null) {
        try {
            agentPullReq.abort();
        } catch (ex) {
            
        }
    }
};


//登陆查询
var askSignIn = function (callback) {
    if (agentPullRunning == true) {
        callback(true);
    } else {
        callback(false);
    }   
};


//桌面右下角通知
var showNotification = function (myTag, title, content) {
    var notification = new Notification(title, {
        dir: "auto",
        lang: "",
        body: content,
        tag: myTag,
        icon: '../icon.png'
    });
};


//打开浏览器新标签
var openWindow = function (url) {
    window.open(url);
};
    

//实时事件处理    
var eventFun = function (json) {
    //showNotification('astCC', '您有新的事件', json);
    //openWindow('http://www.baidu.com');
    
    if (json.source == 'AGENT' && json.event == 'ringing') {
        var translate1 = chrome.i18n.getMessage("newInCall");
        var translate2 = chrome.i18n.getMessage("newCallNotification", [json.calleridnum, json.eventTime]);
        showNotification('asterCC', translate1, translate2);
    }
    
    //事件交给popup.html, 进行页面渲染
    chrome.runtime.sendMessage(json, function (response) {
        //console.log(response);
    });    
};


$(function() {
    if (window.localStorage) {
        if (localStorage.getItem('baseParam') != null) {
            startAgentPull(eventFun);                
        }
    }
});
