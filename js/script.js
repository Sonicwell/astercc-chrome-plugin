var baseParam = {
    userType:'account',
    username: null,
    password: null,
    md5password: null,
    agentno: null,
    agentpassword: null,
    pwdType: 'md5',
    orgidentity: 'astercc',
    pushevent: 'yes'
};
var myInfo = null;
var groupToModel = {};
var curstatus = '未签入';

var CC = (function() {
    var bgModule = null;

    var i18nHtmlPage = function() {
        $('[data-i18n]').each(function () {
            var msg = $(this).attr('data-i18n');
            if (msg != '') {
                var translate = chrome.i18n.getMessage(msg);
                if (translate != '' && translate != msg) {
                    var placeholder = $(this).attr('placeholder');
                    if (placeholder != undefined) {
                        $(this).attr('placeholder', translate);
                    } else {
                        $(this).html(translate);
                    }
                }
            }
        });
    };
    
    var init = function() {
        bgModule = chrome.extension.getBackgroundPage();
        
        bindEvent();
        
        bgModule.askSignIn(function(response){
            if (response) {
                baseParam = JSON.parse(localStorage.getItem('baseParam'));
               
                var serverUrl = baseParam.serverUrl;
                if( serverUrl.indexOf('http://') != -1 ){
                    astercc_ip = serverUrl.split('http://')[1];
                }else if( serverUrl.indexOf('https://') != -1 ){
                    astercc_is_ssl = true;
                    astercc_ip = serverUrl.split('https://')[1];
                }else{
                    astercc_ip = serverUrl;
                }
                
                signIn(false);
            } else {
                $('#confTab > a').tab('show');

                var lastUsername = localStorage.getItem('username');
                var lastPassword = localStorage.getItem('password');
                var lastServerUrl = localStorage.getItem('serverUrl');
                if (lastUsername) {
                    $('#signInForm').find('input[name="username"]').val(lastUsername);
                    $('#signInForm').find('input[name="password"]').val(lastPassword);
                    $('#signInForm').find('input[name="serverUrl"]').val(lastServerUrl);
                }
            }
        });
        
        i18nHtmlPage();
    };
    
    var bindEvent = function() {       
        //设置弹屏地址
        $(document).on('blur', '#popAddress', function() {
        	localStorage.setItem('popAddress', $('#popAddress').val());
            return false;
        });     
             
        //登陆按钮
        $('#signInForm .btn-signIn').on('click', function() {
            var $signInForm = $('#signInForm');
            var username = $signInForm.find('input[name="username"]').val();
            var password = $signInForm.find('input[name="password"]').val();
            var serverUrl = $signInForm.find('input[name="serverUrl"]').val();

           
            if( username == '' ){
                var translate = chrome.i18n.getMessage('enterUsername');
                alert('Please key in Username');
                return ;
            }

            if( password == '' ){
                var translate = chrome.i18n.getMessage('enterPassword');
                alert('Please key in Password');
                return ;
            }
            
            if( serverUrl == '' ){
                var translate = chrome.i18n.getMessage('enterServerurl');
                alert('Please key in Server url');
                return ;
            }

            baseParam.username = username;
            baseParam.password = password;
            baseParam.md5password = md5(password);
            baseParam.serverUrl = serverUrl;

            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            localStorage.setItem('serverUrl', serverUrl);
            
            if( serverUrl.indexOf('http://') != -1 ){
                astercc_ip = serverUrl.split('http://')[1];
            }else if( serverUrl.indexOf('https://') != -1 ){
                astercc_is_ssl = true;
                astercc_ip = serverUrl.split('https://')[1];
            }else{
                astercc_ip = serverUrl;
            }
            
            signIn(true);
            return false;
        });
        
        //登出按钮
        $(document).on('click', '#signOutBtn', function(){
            signOut();
            return false;
        }); 
        
        //坐席组按钮
        $(document).on('click', '#groupBtn', function() {
        	$('#groupModal').modal('show');
            return false;
        });
        
        //签入/签出按钮
        $(document).on('click', '#loginBtn', function() {
            var type = 1; // 签入
            if ($('#loginBtn').attr('name') == 'logout') {
                type = 2; // 签出
            }            
            queueActionCJI(
                type, 
                'agent', 
                baseParam.agentno, 
                baseParam.orgidentity, 
                null, 
                baseParam.pwdType, 
                baseParam.agentpassword, 
                null, 
                baseParam.pushevent, 
                function(result){
                    console.log('签入/签出', result);
                });
            
            return false;
        });

        //暂停/取消暂停按钮
        $(document).on('click','#pauseBtn', function() {
            if ($('#pauseBtn').attr('name') == 'pause') {
                $('#pauseModal').modal('show');
                return false;
            } else {
                queuePauseCJI(
                    2,
                    'agent', 
                    baseParam.agentno, 
                    baseParam.orgidentity, 
                    baseParam.pwdType, 
                    baseParam.agentpassword, 
                    '', 
                    baseParam.pushevent, 
                    function(result){
                        console.log('取消暂停操作', result);
                    }, '');            
            }
        });

        //暂停
        $(document).on('click','#pauseModal .btn-ok', function() {
            var reasonVal = $('#reasonSelect > option:selected').val();

            if( reasonVal != null && reasonVal != ''){
                var type = 1;
                var $textareaReson = $('#textareaReson');
                if( $.trim(reasonVal) == 'other(其它)' ){
                    reasonVal = $textareaReson.val();
                    if( $.trim(reasonVal) == '' ){
                        var translate = chrome.i18n.getMessage('enterReason');
                        alert(translate);
                        $textareaReson.focus();

                        return false;
                    }
                }

                queuePauseCJI(
                    type,
                    'agent', 
                    baseParam.agentno, 
                    baseParam.orgidentity, 
                    baseParam.pwdType, 
                    baseParam.agentpassword, 
                    reasonVal, 
                    baseParam.pushevent, 
                    function(result){
                        $('#pauseModal').modal('hide');
                        console.log('暂停操作', result);
                    }, 
                    '');
                
            }
        });

        //切换暂停原因
        $(document).on('change', '#reasonSelect', function() {
            var selectedOpt = $(this).find('option:selected').val();
            
            var $extraReasonBox = $('#pauseModal .extraReasonBox');
            if( $.trim(selectedOpt) == 'other(其它)' ){
                $extraReasonBox.show();
            }else{
                $extraReasonBox.hide();
            }
        });
        
        //结束话后
        $(document).on('click', '#acwBtn', function() {
            if ($('#acwBtn').attr('disabled') == 'disabled') {
                return false;
            }
            
            acwOffCJI('agent', baseParam.agentno, baseParam.orgidentity, baseParam.pwdType, baseParam.agentpassword, baseParam.pushevent, function(result) {
                console.log('结束话后', result);
            });
            return false;
        });        
        
        //拨号按钮，打开拨号界面
        $(document).on('click','#dialBtn', function() {
            if ($('#pauseBtn').attr('name') == 'unpause') {
                var translate = chrome.i18n.getMessage('DontCallPause');
                alert(translate);
                return false;
            }

            if ($('#acwBtn').attr('disabled') != 'disabled') {
                var translate = chrome.i18n.getMessage('DontCallAcw');
                alert(translate);
                return false;
            }
            
            var $targetGroupSelect = $('#dialModal select[name="targetGroup"]');
            $targetGroupSelect.find('option').remove();
            
            $('#groupModal .login-table > tbody > tr').each(function () {
                if ($(this).find('> td:eq(1) > input:checkbox').attr('checked') == 'checked') {
                    var agent_group_id = $(this).find('> td:eq(0)').attr('name');
                    if ($('#agid'+agent_group_id+'Q input[name="workMode'+agent_group_id+'"]:checked').val() != 'dialin') {
                        $targetGroupSelect.append($('<option value="' + agent_group_id + '">' + $(this).find('> td:eq(0)').text() + '</option>'));
                    }
                }
            });
            
            $targetGroupSelect.trigger('change');
            
        	$('#dialModal').modal('show');
            return false;
        });
        
        //拨号界面，拨号
        $(document).on('click','#dialModal .btn-ok', function() {
            var agent_group_id = $('#dialModal select[name="targetGroup"]').val();
            var number = $('#dialModal input[name="targetNumber"]').val();
            var modelVal = $('#dialModal select[name="applyObj"]').val();

            if (agent_group_id == null || agent_group_id == '') {
                var translate = chrome.i18n.getMessage('selectAgentGroup');
                alert(translate);
                return false;
            }

            if (number == null || number == '') {
                var translate = chrome.i18n.getMessage('enterTargetNum');
                alert(translate);
                $('#dialModal input[name="targetNumber"]').focus();
                return false;
            }

            if (modelVal == null || modelVal == '') {
                var translate = chrome.i18n.getMessage('selectApp');
                alert(translate);
                return false;
            }

            var modelAry = modelVal.split('-');

            makeCallCJI(
                number, 
                'exter', 
                agent_group_id, 
                'agent', 
                baseParam.agentno, 
                baseParam.orgidentity, 
                baseParam.pwdType, 
                baseParam.agentpassword, 
                modelAry[0], 
                modelAry[1], 
                null /*userdata*/, 
                function(result){
                    console.log('申请拨号', result);
                    $('#dialModal').modal('hide');
                }, 
                null /*agentexten*/, 
                null /*callerid*/, 
                null /*callername*/, 
                null /*trunkidentity*/, 
                null /*cidtype*/);
        });        
        
        //拨号界面，切换坐席组
        $(document).on('change', '#dialModal select[name="targetGroup"]', function() {
            var agent_group_id = $(this).find('option:selected').val();
            
            var optHtml = '';
            if (groupToModel[agent_group_id].campaigns.length > 0) {
                var translate = chrome.i18n.getMessage('Campaign');
                optHtml += '<optgroup label="'+translate+'">';
                $.each(groupToModel[agent_group_id].campaigns, function (i, model) {
                    optHtml += '<option value="Campaign-'+model.id+'">'+model.name+'</option>';
                });                
                optHtml += '</optgroup>';
            }

            if (groupToModel[agent_group_id].virtualcustomers.length > 0) {
                var translate = chrome.i18n.getMessage('VirtualCustomer');
                optHtml += '<optgroup label="'+translate+'">';
                $.each(groupToModel[agent_group_id].virtualcustomers, function (i, model) {
                    optHtml += '<option value="Virtualcustomer-'+model.id+'">'+model.name+'</option>';
                });                
                optHtml += '</optgroup>';
            }
            
            if (groupToModel[agent_group_id].customerservices.length > 0) {
                var translate = chrome.i18n.getMessage('CustomerService');
                optHtml += '<optgroup label="'+translate+'">';
                $.each(groupToModel[agent_group_id].customerservices, function (i, model) {
                    optHtml += '<option value="Customerservice-'+model.id+'">'+model.name+'</option>';
                });                
                optHtml += '</optgroup>';
            }            
            
            $('#dialModal select[name="applyObj"]').html(optHtml);           
        });                    


        //咨询
        $(document).on('click', '#consultBtn', function() {
            if (curstatus != '通话中') {
                var translate = chrome.i18n.getMessage('consultWhenCall');
                alert(translate);
                return false;
            }
            
            var $targetGroupSelect = $('#consultGroup');
            $targetGroupSelect.find('option').remove();
            $('#groupModal .login-table > tbody > tr').each(function () {
                var agent_group_id = $(this).find('> td:eq(0)').attr('name');
                $targetGroupSelect.append($('<option value="' + agent_group_id + '">' + $(this).find('> td:eq(0)').text() + '</option>'));
            });
            
            $('#consultModal').modal('show');
            return false;
        });
        
        //咨询界面，切换咨询类型
        $(document).on('change', '#consultModal input[name="consultType"]', function() {
            if ($('#consultModal input[name="consultType"]:checked').val() == 'internal') {
                $('#consultGroupDiv').show();
            } else {
                $('#consultGroupDiv').hide();
            }
        });         

        //咨询界面，拨号
        $(document).on('click','#consultModal .btn-ok', function() {
            var consultType = $('#consultModal input[name="consultType"]:checked').val();
            var consultTarget = $('#consultTarget').val();

            if (consultTarget == null || consultTarget == '') {
                var translate = chrome.i18n.getMessage('enterConsultObj');
                alert(translate);
                return false;
            }
            
            var consultGroupId = 0;
            if (consultType == 'internal') {
                consultGroupId = $('#consultGroup').val();
            }
            
            if (consultType == 'internal' && (consultGroupId == '0' || consultGroupId == '' || consultGroupId == null)) {
                var translate = chrome.i18n.getMessage('selectAgentGroup');
                alert(translate);
                return false;               
            }
            
            consultCJI(consultTarget, consultGroupId, consultType, baseParam.pwdType, baseParam.agentpassword, 'agent', baseParam.agentno, baseParam.orgidentity, function(result) {
                console.log('咨询', result);
                $('#consultModal').modal('hide');
            });
        });

        //接回
        $(document).on('click', '#cbBtn', function() {
            if (curstatus != '咨询振铃' || curstatus != '咨询应答') {
                var translate = chrome.i18n.getMessage('cbWhenConsulting');
                alert(translate);
                return false;
            }
            
            callReturnCJI(baseParam.pwdType, baseParam.agentpassword, 'agent', baseParam.agentno, baseParam.orgidentity, function(result) {
                console.log('接回', result);
            });

            return false;
        });

        //转接
        $(document).on('click', '#transBtn', function() {
            if (curstatus != '咨询应答') {
                var translate = chrome.i18n.getMessage('transferWhenConsultAnswer');
                alert(translate);
                return false;
            }

            transferCJI(baseParam.pwdType, baseParam.agentpassword, 'agent', baseParam.agentno, baseParam.orgidentity, function(result) {
                console.log('转接', result);
            });

            return false;
        });
        
        //会议
        $(document).on('click', '#confBtn', function() {
            if (curstatus != '咨询应答') {
                var translate = chrome.i18n.getMessage('conferenceWhenConsultAnswer');
                alert(translate);
                return false;
            }

            conferenceCJI(baseParam.pwdType, baseParam.agentpassword, 'agent', baseParam.agentno, baseParam.orgidentity, function(result) {
                console.log('会议', result);
            });

            return false;
        });
        
        //保持/恢复通话
        $(document).on('click', '#holdBtn', function() {
            if (curstatus != '通话中' && curstatus != '保持') {
                var translate = chrome.i18n.getMessage('dontActionWhenCurState');
                alert(translate);
                return false;
            }

            if (curstatus == '通话中') {
                //保持 0不静音  1静音
                holdCJI(1, baseParam.orgidentity, 'agent', baseParam.agentno, baseParam.pwdType, baseParam.agentpassword, function(result) {
                    console.log('保持', result);
                });
            } else if (curstatus == '保持') {
                //恢复通话
                resumeCJI(baseParam.orgidentity, 'agent', baseParam.agentno, baseParam.pwdType, baseParam.agentpassword, function(result) {
                    console.log('恢复通话', result);
                });                
            }

            return false;
        });        
    };   
 
    //获取登陆者信息
    var signIn = function (loadAgentPull) {
        getMyInfo(baseParam.username, baseParam.md5password, baseParam.pwdType, function (myInfoResult){
            if (myInfoResult != null && myInfoResult.code == 1) {
                myInfo = myInfoResult;
                baseParam.agentno = myInfoResult.agentno;
                baseParam.agentpassword = myInfoResult.agentpassword;
                baseParam.orgidentity = myInfoResult.orgidentity;
                
                localStorage.setItem('baseParam', JSON.stringify(baseParam));
                signInSuccess(loadAgentPull);
            } else {
                var translate = chrome.i18n.getMessage('SignInFailed');
                alert(translate);
            }
        });
    };
    
    //初始化CTI界面
    var signInSuccess = function(loadAgentPull) {
        $('#myTabs a:first').tab('show');

        var lastPopAddress = localStorage.getItem('popAddress');
        if (lastPopAddress) {
            $('#popAddress').val(lastPopAddress);
        }
                
        renderStatus();
        
        if (loadAgentPull) {
            bgModule.startAgentPull(bgModule.eventFun);
        }
    };
    
    //登出，可更换账号
    var signOut = function () {
        bgModule.stopAgentPull();
        
        myInfo = null;
        
        if (window.localStorage) {
            localStorage.removeItem('baseParam');
        }
    
        $('#myTabs a:eq(2)').tab('show');

        var lastUsername = localStorage.getItem('username');
        var lastPassword = localStorage.getItem('password');
        var lastServerUrl = localStorage.getItem('serverUrl');
        if (lastUsername) {
            $('#signInForm').find('input[name="username"]').val(lastUsername);
            $('#signInForm').find('input[name="password"]').val(lastPassword);
            $('#signInForm').find('input[name="serverUrl"]').val(lastServerUrl);
        }
    };    

    //状态初始化
    var renderStatus = function () {
        $('#groupModal .login-table > tbody > tr').remove();
        var translate1 = chrome.i18n.getMessage('DefaultGroup');
        var translate2 = chrome.i18n.getMessage('ringACW');
        var translate3 = chrome.i18n.getMessage('answerACW');
        var translate4 = chrome.i18n.getMessage('closedACW');
        var translate5 = chrome.i18n.getMessage('All');
        var translate6 = chrome.i18n.getMessage('onlyDialIn');
        var translate7 = chrome.i18n.getMessage('onlyDialOut');
        
        var $tmpl = 
        $('<tr>'+
            '<td>座席组1</td>'+
            '<td align="center">'+
                '<input class="checkin-radio" type="radio" name="defaultGroup" title="'+translate1+'">&nbsp;'+
                '<input class="checkin-checkbox" type="checkbox">'+
            '</td>'+
            '<td align="center">'+
                '<input class="acw-radio" name="acwMode3" type="radio" title="'+translate2+'" value="ring">&nbsp;'+
                '<input class="acw-radio" name="acwMode3" type="radio" title="'+translate3+'" value="answer">&nbsp;'+
                '<input class="acw-radio" name="acwMode3" type="radio" title="'+translate4+'" value="off">'+
            '</td>'+
            '<td align="center">'+
                '<input class="workmodel-radio" name="workMode3" type="radio" title="'+translate5+'" value="all">&nbsp;'+
                '<input class="workmodel-radio" name="workMode3" type="radio" title="'+translate6+'" value="dialin">&nbsp;'+
                '<input class="workmodel-radio" name="workMode3" type="radio" title="'+translate7+'" value="dialout">'+
            '</td>'+
        '</tr>');

        $.each(myInfo.agent_group, function (i, agentGroup) {
            console.log(agentGroup);
            
            //按钮初始化
            groupToModel[agentGroup.agent_group_id] = {
                "campaigns": agentGroup.campaigns,
                "customerservices": agentGroup.customerservices,
                "virtualcustomers": agentGroup.virtualcustomers
            };
            
            if (agentGroup.status != 'logoff' && agentGroup.agenttype != 'static' && $('#loginBtn').attr('name') == 'login') {
                if (curstatus != '话后' && curstatus != '暂停' && curstatus != '振铃' && curstatus != '通话中') {
                    curstatus = '空闲';
                }
                var translate = chrome.i18n.getMessage('Logout');
                $('#loginBtn').attr('name', 'logout').find('div').html(translate);
            }
            
            if (agentGroup.status == 'pause') {
                if (agentGroup.acw_status != '') {
                    curstatus = '话后';
                    $('#acwBtn').removeAttr('disabled');
                } else {
                    curstatus = '暂停';
                    var translate = chrome.i18n.getMessage('UnPause');
                    $('#pauseBtn').attr('name', 'unpause').find('div').html(translate);
                }
            }
            
            if (agentGroup.status == 'busy') {
                curstatus = '通话中';
            } else if (agentGroup.status == 'ringing') {
                curstatus = '振铃';
            }
            
            //坐席组列表初始化
            var $tr = $tmpl.clone();
            $tr.attr('id', 'agid'+agentGroup.agent_group_id+'Q');
            $tr.find('> td:eq(0)').text(agentGroup.groupname).attr('name', agentGroup.agent_group_id);
            
            //签入
            $tr.find('> td:eq(1) > input:checkbox').attr('id', 'queue' + agentGroup.agent_group_id);
            if (agentGroup.status != 'logoff') {
                $tr.find('> td:eq(1) > input:checkbox').attr('checked', 'checked');
                if (agentGroup.agenttype == 'static') {
                    $tr.find('> td:eq(1) > input:checkbox').attr('disabled', 'disabled');
                }
            }
            $(document).on('click', '#queue'+agentGroup.agent_group_id, function() {
                queueAction(agentGroup.agent_group_id);
                return false;
            });
            
            //默认组
            $tr.find('> td:eq(1) > input:radio').attr('id', 'defaultGroup'+agentGroup.agent_group_id);
            if (myInfo.dialout_default_group_id == agentGroup.agent_group_id) {
                $tr.find('> td:eq(1) > input:radio').attr('checked', 'checked');
            }
            $(document).on('click', '#defaultGroup'+agentGroup.agent_group_id, function() {
                defaultGroupChange(agentGroup.agent_group_id);
            });
            
            //话后模式
            $tr.find('> td:eq(2) > input').attr('name', 'acwMode' + agentGroup.agent_group_id);
            if (agentGroup.auto_acw == 'ring') {
                $tr.find('> td:eq(2) > input:eq(0)').attr('checked', 'checked');
            } else if (agentGroup.auto_acw == 'answer') {
                $tr.find('> td:eq(2) > input:eq(1)').attr('checked', 'checked');
            } else {
                $tr.find('> td:eq(2) > input:eq(2)').attr('checked', 'checked');
            }
            $(document).on('click', 'input[name=acwMode'+agentGroup.agent_group_id+']', function() {
                acwModeChange(agentGroup.agent_group_id);
                return false;
            });            
            
            //工作模式
            $tr.find('> td:eq(3) > input').attr('name','workMode' + agentGroup.agent_group_id );
            if (agentGroup.workway == 'dialin') {
                $tr.find('> td:eq(3) > input:eq(1)').attr('checked', 'checked');
            } else if (agentGroup.workway == 'dialout') {
                $tr.find('> td:eq(3) > input:eq(2)').attr('checked', 'checked');
            } else {
                $tr.find('> td:eq(3) > input:eq(0)').attr('checked', 'checked');
            }
            $(document).on('click', 'input[name=workMode'+agentGroup.agent_group_id+']', function() {
                workModeChange(agentGroup.agent_group_id);
                return false;
            });            

            $('#groupModal .login-table > tbody').append($tr);
        });
        
        var j=0, len=myInfo.cdrs.length;
        for (j; j<len; j++) {
            if (myInfo.cdrs[j].CurpbxcdrSub.curstatus == 'ONHOLD') {
                //保持
                curstatus = '保持';                
                var translate = chrome.i18n.getMessage('Resume');
                $('#holdBtn').find('div').html(translate);
                break;
            } else if (myInfo.cdrs[j].CurpbxcdrSub.calltype == 'CONSULT') {
                if (myInfo.cdrs[j].CurpbxcdrSub.endtime != '0000-00-00 00:00:00' && myInfo.cdrs[j].CurpbxcdrSub.answertime == '0000-00-00 00:00:00') {
                    curstatus = '咨询振铃';
                } else {
                    //TODO:咨询应答 or 会议-通话中？
                }
            }
        }
        
        var curstatusTranslate = {
            "保持": "Hold",
            "咨询振铃": "consultRing",
            "振铃": "Ringing",
            "通话中": "Calling",
            "暂停": "Pause",
            "话后": "ACW",
            "空闲": "Idle",
            "咨询应答": "consultAnswered"
        };
        var translatex = chrome.i18n.getMessage(curstatusTranslate[curstatus]);
        $('#statusText').html(translatex);
    };    
    
    return {
        "init": init
    };    
})();

$(function() {
    CC.init();
});

//队列签入/签出
function queueAction(agent_group_id) {
    var type = 1;
    if ($('#queue'+agent_group_id).attr('checked') == 'checked') {
        type = 2;
    }

    queueActionCJI(
        type, 
        'agent', 
        baseParam.agentno, 
        baseParam.orgidentity, 
        agent_group_id+',', 
        baseParam.pwdType, 
        baseParam.agentpassword, 
        null, 
        baseParam.pushevent, 
        function(result){
            console.log('签入/签出', result);
        }
    );    
}


//设置默认组
function defaultGroupChange(agent_group_id) {
	setDefaultGroupCJI('agent', baseParam.agentno, baseParam.orgidentity, baseParam.pwdType, baseParam.agentpassword, agent_group_id, function(result) {
        console.log('设置默认组', result);
        if (result.code == '2') {
            $('input[name=defaultGroup]').removeAttr('checked');
            $('#defaultGroup'+result.message).prop('checked', true);
            $('#defaultGroup'+result.message).attr('checked', 'checked');
        }
    });    
}


//切换话后模式                
function acwModeChange(agent_group_id) {
    if ($('#queue'+agent_group_id).attr('checked') != 'checked') {
        return false;
    }
    
    var acwVal = $('input[name=acwMode'+agent_group_id+']:checked').attr('value');
    var type = {'ring': 1, 'answer': 2, 'off': 3}
    acwActionCJI(type[acwVal], 'agent', baseParam.agentno, baseParam.orgidentity, baseParam.pwdType, baseParam.agentpassword, agent_group_id, baseParam.pushevent, function(result) {
        console.log('切换话后模式', result);
    });
}

//切换工作模式
function workModeChange(agent_group_id) {
    if ($('#queue'+agent_group_id).attr('checked') != 'checked') {
        return false;
    }
    
    var status = $('input[name=workMode'+agent_group_id+']:checked').attr('value');
    workwayActionCJI(status, 'agent', baseParam.agentno, baseParam.orgidentity, baseParam.pwdType, baseParam.agentpassword, agent_group_id, baseParam.pushevent, function(result) {
        console.log('切换工作模式', result);
    });
}

function setRadio(radioName, checkIndex) {
    $('input[name='+ radioName +']').removeAttr('checked');
    $('input[name='+ radioName +']').eq(checkIndex).prop('checked', true);
    $('input[name='+ radioName +']').eq(checkIndex).attr('checked', 'checked');
}

//接收实时事件
chrome.runtime.onMessage.addListener(function(json, sender, sendResponse){
    console.log('新的事件', json);
    if (json.event == 'nopaused') {
        //取消暂停
        var translate = chrome.i18n.getMessage('Pause');
        $('#pauseBtn').attr('name', 'pause').find('div').html(translate);
        
        translate = chrome.i18n.getMessage('Idle');
        $('#statusText').html(translate);
    } else if (json.event == 'paused') {
        //暂停
        var translate = chrome.i18n.getMessage('UnPause');
        $('#pauseBtn').attr('name', 'unpause').find('div').html(translate);
        
        translate = chrome.i18n.getMessage('Pause');
        $('#statusText').html(translate);
    } else if (json.event == 'login') {
        //签入
        $('#queue'+json.AgentGroupId).removeAttr('checked');
        $('#queue'+json.AgentGroupId).prop('checked', true);
        $('#queue'+json.AgentGroupId).attr('checked', 'checked');
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(1) > input:checkbox').removeAttr('checked');
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(1) > input:checkbox').prop('checked', true);

        var translate = chrome.i18n.getMessage('Logout');            
        $('#loginBtn').attr('name', 'logout').find('div').html(translate);
        
        translate = chrome.i18n.getMessage('Idle');
        $('#statusText').html(translate);
    } else if (json.event == 'logoff') {
        //签出
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(1) > input:checkbox').removeAttr('checked');
        $('#queue'+json.AgentGroupId).removeAttr('checked');
        
        var logoff = 'yes';
        $('#groupModal .login-table > tbody > tr').each(function () {
            if ($(this).find('> td:eq(1) > input:checkbox').attr('checked') == 'checked' && $(this).find('> td:eq(1) > input:checkbox').attr('disabled') != 'disabled') {
                logoff = 'no';
            }
        });
        
        if (logoff == 'yes') {
            var translate = chrome.i18n.getMessage('Logoff');
            $('#statusText').html(translate);

            translate = chrome.i18n.getMessage('Login');
            $('#loginBtn').attr('name', 'login').find('div').html(translate);
        }
        
    } else if (json.event == 'acwoff') {
        //话后模式-关闭
        setRadio('acwMode' + json.AgentGroupId, 2);
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(2) > input:eq(2)').attr('checked', 'checked');
        
    } else if (json.event == 'acwring') {
        //话后模式-振铃
        setRadio('acwMode' + json.AgentGroupId, 0);
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(2) > input:eq(0)').attr('checked', 'checked');
        
    } else if (json.event == 'acwanswer') {
        //话后模式-应答
        setRadio('acwMode' + json.AgentGroupId, 1);
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(2) > input:eq(1)').attr('checked', 'checked');
        
    } else if (json.event == 'workwayall') {
        //工作模式-全部
        setRadio('workMode' + json.AgentGroupId, 0);
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(3) > input:eq(0)').attr('checked', 'checked');
        
    } else if (json.event == 'workwaydialin') {
        //工作模式-仅呼入
        setRadio('workMode' + json.AgentGroupId, 1);
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(3) > input:eq(1)').attr('checked', 'checked');
        
    } else if (json.event == 'workwaydialout') {
        //工作模式-仅呼出
        setRadio('workMode' + json.AgentGroupId, 2);
        //$('#agid'+json.AgentGroupId+'Q').find('> td:eq(3) > input:eq(2)').attr('checked', 'checked');
        
    } else if (json.source == 'CONSULT') {
        if (json.event == 'ringing') {
            curstatus = '咨询振铃';
            
            var translate = chrome.i18n.getMessage('consultRing');
            $('#statusText').html(translate);
        } else if (json.event == 'answer') {
            curstatus = '咨询应答';
            
            var translate = chrome.i18n.getMessage('consultAnswered');
            $('#statusText').html(translate);
        } else if (json.event == 'join' || json.event == 'hangup') {
            curstatus = '通话中';
            
            var translate = chrome.i18n.getMessage('Calling');
            $('#statusText').html(translate);
        }
    } else if (json.source == 'AGENT' && json.event == 'ringing') {
        var translate = chrome.i18n.getMessage('Ringing');
        $('#statusText').html(translate);
        
        //弹屏
        var popUrl = $('#popAddress').val();
        if (popUrl != '') {
            if (popUrl.indexOf('##') != '-1') {
                //变量替换模式
                ['activenum','agentno','calleridnum','AgentGroupId','AgentTeamId','calltype','eventTime','modeltype','model_id','sessionid'].map(function(item) {
                    var reg = new RegExp("##" + item + "##", "g");
                    popUrl = popUrl.replace(reg, json[item]);
                });
            } else {
                //变量接入模式
                if (popUrl.indexOf('?') == '-1') {
                    popUrl += '?';
                } else {
                    popUrl += '&';
                }
                ['activenum','agentno','calleridnum','AgentGroupId','AgentTeamId','calltype','eventTime','modeltype','model_id','sessionid'].map(function(item) {
                    popUrl += item + '=' + json[item] + '&';
                });
            }
            window.open(popUrl);
        }
    } else if (json.source != 'AGENT' && json.event == 'answer') {
        curstatus = '通话中';
        
        var translate = chrome.i18n.getMessage('Calling');
        $('#statusText').html(translate);
    } else if (json.event == 'onhold') {
        //保持
        curstatus = '保持';
        
        var translate = chrome.i18n.getMessage('Hold');
        $('#statusText').html(translate);
        
        translate = chrome.i18n.getMessage('Resume');
        $('#holdBtn').find('div').html(translate);
    } else if (json.event == 'resume') {
        //保持取消
        curstatus = '通话中';
        
        var translate = chrome.i18n.getMessage('Calling');
        $('#statusText').html(translate);
        
        translate = chrome.i18n.getMessage('Hold');
        $('#holdBtn').find('div').html(translate);
    } else if (json.event == 'acwstop') {
        //结束话后
        var translate = chrome.i18n.getMessage('Idle');
        $('#statusText').html(translate);
        
        $('#acwBtn').attr('disabled', 'disabled');
    } else if (json.event == 'hangupacw') {
        curstatus = '话后';
        //进入话后模式
        var translate = chrome.i18n.getMessage('ACW');
        $('#statusText').html(translate);
        $('#acwBtn').removeAttr('disabled');
    } else if (json.source == 'AGENT' && json.event == 'hangup') {
        curstatus = '空闲';
        
        var translate = chrome.i18n.getMessage('Idle');
        $('#statusText').html(translate);
    }
    
    sendResponse('OK');
});
