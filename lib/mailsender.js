
var send_task = {};
electron.ipcRenderer.on('send_mail_progress', function(event, ret){
    var resp = send_task[ret.reqid];
    if(!resp){
        return ;
    }
    resp.progress_cb(ret);
});

electron.ipcRenderer.on('send_mail_end', function(event, ret){
    var resp = send_task[ret.reqid];
    if(!resp){
        return;
    }
    resp.end_cb(ret);
    delete send_task[ret.reqid];
});

module.exports.send = function(opts, end_cb, progress_cb){
    var reqid = electron.ipcRenderer.sendSync('mail_sender', {cmd:'send', args:opts});
    send_task[reqid] = {reqid:reqid, end_cb:end_cb, progress_cb:progress_cb};
    return reqid;
};

module.exports.pause = function(reqid){
    return electron.ipcRenderer.sendSync('mail_sender', {cmd:'pause', reqid:reqid});
};

module.exports.continue = function(reqid){
    return electron.ipcRenderer.sendSync('mail_sender', {cmd:'continue', reqid:reqid});
};

module.exports.cancel = function(reqid){
     var ret = electron.ipcRenderer.sendSync('mail_sender', {cmd:'cancel', reqid:reqid});
     if(!ret){
         return false;
     }
     delete send_task[reqid];
     return ret;
};
