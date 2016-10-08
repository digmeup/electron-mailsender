var nodemailer = require('nodemailer');
var electron = require('electron');
var db ;

var req_id = 1;
var send_task = {};

function mail_send_req(event, arg){
    var req = false;
    if(arg.cmd == 'send'){
        var rid = 'req-'+(req_id++);
        var req_obj = {
            reqid:rid,
            inited:false,
            sender:event.sender,
            args:arg.args
        };
        send_task[rid] = req_obj;
        var smail = init_sender.bind(req_obj);
        event.returnValue = rid;
        setTimeout(smail, 0);
    }else if(arg.cmd == 'pause'){
        req = send_task[arg.reqid];
        if(!req){
            event.returnValue = false;
        }else{
            req.state = 'pause';
            event.returnValue = true;
        }
    }else if(arg.cmd == "continue"){
        req = send_task[arg.reqid];
        if(!req){
            event.returnValue = false;
        }else{
            event.returnValue = true;
            req.state = 'sending';
            var call = send_mail.bind(req);
            setTimeout(call, 0);
        };
    }else if(arg.cmd == 'cancel'){
        req = send_task[arg.reqid];
        if(!req){
            event.returnValue = false;
        }else{
            req.state = 'stop';
            event.returnValue = true;
            //delete send_task[arg.reqid];
        }
    }
}

function init_sender(){

    var args = this.args;
    console.log('send opts:', args);
    this.transporter = nodemailer.createTransport({
        host:"smtpdm.aliyun.com",
        port:25,
        secureConnection:true,
        auth:{
            user:args.sender,
            pass:args.smtp_pwd
        }
    });

    this.mailOptions = {
        from:'"'+args.sender_name+'"'+'<'+args.sender+'>',
        replyTo:"pm@wencheka.com"
    };

    if(args.contents.length == 1 ){
        this.send_content = args.contents[0];
    }else{
        var p = parseInt(Math.random() * args.contents.length);
        this.send_content = args.contents[p];
    }

    db.get_group_contacts_all(function(ret){
        if(!ret){
            this.sender.send('send_mail_end', {reqid:this.reqid, status:'FETCH_MAILS_FAILED'});
            delete send_task[this.reqid];
        }else if(ret.length == 0){
            this.sender.send('send_mail_end', {reqid:this.reqid, status:'MAILS_EMPTY'});
            delete send_task[this.reqid];
        }else{
            this.inited = true;
            this.state = 'sending';
            this.mail_list = ret;
            this.pos = 0;
            var call = send_mail.bind(this);
            call();
        }
    }.bind(this), {gid:args.receive_group.id});
}

function get_receives(){
    var bcc = '';
    var true_send = 0;
    var receive = null;
    var pos = this.pos;
    this.send_len = 5;
    this.will_sends = [];
    for(var i = pos; i < pos + this.send_len; i++){
        receive = this.mail_list[i];
        if(true_send == 0){
            if(!receive){
                return -1;
            }
            this.mailOptions.to = receive.mail;
        }else if(true_send == 1){
            if(!receive){
                break;
            }
            bcc = receive.mail;
        }else{
            if(!receive){
                break;
            }
            bcc += (', ' + receive.mail);
        }
        this.will_sends.push(receive);
        true_send++;
    }
    this.send_len = true_send;
    if(bcc){
        this.mailOptions.bcc = bcc;
    }
    return 0;
}

function send_mail(){
    if(this.state == 'pause' || this.state == 'stop'){
        if(this.state == 'stop'){
            delete send_task[this.reqid];
        }
        return;
    }
    var args = this.args;
    var ipc_sender = this.sender;
    var reqid = this.reqid;
    var pos = this.pos;

    var cb = get_receives.bind(this);
    var ret =  cb();
    if(ret < 0){
        delete send_task[this.reqid];
        return;
    }

    console.log("will send mail,", pos,'send_len:', this.send_len, 'state', this.state );
    //this.mailOptions.to = receive.mail;
    this.mailOptions.subject = this.send_content.title;
    this.mailOptions.html = this.send_content.content;
    this.transporter.sendMail(this.mailOptions, function(error, info){
        if(error){
            this.sender.send('send_mail_progress', {reqid:this.reqid, status:'MAILS_SEND_FAILED', mails:this.will_sends, pos:pos+this.send_len, error:error, progress:((pos+this.send_len)+'/'+this.mail_list.length), opts:this.mailOptions});
        }else{
            this.sender.send('send_mail_progress', {reqid:this.reqid, status:'MAILS_SEND_DONE', mails:this.will_sends, pos:pos+this.send_len, info:info, progress:((pos+this.send_len)+'/'+this.mail_list.length), opts:this.mailOptions});
        }
        this.pos += this.send_len;
        if(this.pos >= this.mail_list.length){//发件结束
            this.sender.send('send_mail_end', {reqid:this.reqid, status:'DONE'});
            delete send_task[this.reqid];
        }else{
            if(args.contents.length == 1 ){
                this.send_content = args.contents[0];
            }else{
                var p = parseInt(Math.random() * args.contents.length);
                this.send_content = args.contents[p];
            }
            var smail = send_mail.bind(this);
            console.log('will send next: ', this.pos, 'mail_length', this.mail_list.length);
            var extrTime = parseInt(Math.random() * 10) * 1000;
            if(!this.pos % 50){
                extrTime = 20 * 60 * 100;
            }
            var sleept = parseInt(args.send_interval)*1000 + extrTime;
            console.log('will sleep:', sleept);
            setTimeout(smail, sleept);
        }
    }.bind(this));
}

module.exports.init_sender_server = function(db_obj){
    db = db_obj;
    electron.ipcMain.on('mail_sender', mail_send_req);
};

/*
function msg_receiver(data){
    console.log('child got message:', data);
    data.get_contents(function(ret){
        console.log('contetns:',ret);
    });
}

function test(){
var transporter = nodemailer.createTransport({
    "host": "smtpdm.aliyun.com",
    "port": 25,
    "secureConnection": true, // use SSL
    "auth": {
        "user": 'pm@mail.wencheka.com', // user name
        "pass": 'zoker123789456'         // password
    }
});

var mailOptions = {
    from: '"咖小编"<pm@mail.wencheka.com>', // sender address mailfrom must be same with the user
    to: '9@qq.com', // list of receivers
    replyTo:'"咖小编" pm@wencheka.com',
    subject: '神秘的问候', // Subject line
    text: 'Hello world', // plaintext body
    html: '<p> 你好！ </p><p> 现在问车咖网站开放了资料和电路图两个板块。大量汽修资料在不断丰富当中，在此邮件点击进入注册将拥有永久免费阅读权限。拥有装在手机里的汽修资料库，将成为现实。</p><p><a href="http://www.wencheka.com" target="_blank" title="进入网站">进入网站</a></p><p><img src="http://staticmain.wencheka.com/img/mail_bottom3.jpg"/></p>'
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response, 'info:', info);

});

var response = {"accepted":["feifei198926@163.com","feifei198926@qq.com"],"rejected":[],"response":"250 Data Ok: queued as freedom ###envid=82861583117","envelope":{"from":"pm@mail.wencheka.com","to":["feifei198926@163.com","feifei198926@qq.com"]},"messageId":"14ac7dde-f282-22b3-b807-c6d77efa62d8@mail.wencheka.com"};
}
*/
