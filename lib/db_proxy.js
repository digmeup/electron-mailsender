var reqs = {};
electron.ipcRenderer.on('db_resp', function(event, ret){
    if(!reqs[ret.reqid]){
        return;
    }
    reqs[ret.reqid](ret.data);
    delete reqs[ret.reqid];
});

module.exports.get_groups = function(cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {cmd:"get_groups"});
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.add_group  = function(name, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:"add_group",
        args:{name:name}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.del_group  = function(gid, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:"del_group",
        args:{gid:gid}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.edit_group  = function(gid,name, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:"edit_group",
        args:{gid:gid, name:name}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.del_person_batch =  function(ids, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:"del_person_batch",
        args:{ids:ids}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.del_person = function(id, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:"del_person",
        args:{id:id}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.add_person = function (mail, gid, cb) {
    // body...
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:"add_person",
        args:{gid:gid, mail:mail}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.get_group_contacts = function(gid, offset, limit, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:"get_group_contacts",
        args:{gid:gid, offset:offset, limit:limit}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.add_contents = function(title, content, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:'add_contents',
        args:{title:title, content:content}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.del_contents = function(cid, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:'del_contents',
        args:{cid:cid}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.edit_contents = function(cid, data, cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:'edit_contents',
        args:{cid:cid, data:data}
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};

module.exports.get_contents = function(cb){
    var reqid = electron.ipcRenderer.sendSync('db_req', {
        cmd:'get_contents'
    });
    if(!reqid){
        return false;
    }
    reqs[reqid] = cb;
    return true;
};
