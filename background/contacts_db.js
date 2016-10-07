var sqlite = require('sqlite3');
var electron = require('electron');
var fs = require('fs');
if(!fs.existsSync('storage/')){
    fs.mkdirSync('storage/');
}
var db = new sqlite.Database('storage/contacts.db');

db.run("create TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, mail TEXT NOT NULL, gid INTEGER DEFAULT 0)");

db.run("create TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)");

db.run("create TABLE IF NOT EXISTS contents (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL)");

module.exports.get_groups = function(cb){
    var sql = "SELECT * FROM groups ORDER BY id DESC;";
    db.all(sql, function(err, rows){
        if(err){
            return cb(false);
        }
        cb(rows);
    });
};

module.exports.add_group =  function(cb, args){
    var name = args.name;
    var sql = "SELECT COUNT(*) AS count FROM groups WHERE name = ? ;";
    db.get(sql, name, function(err, row){
        if(err){
            return cb({resp_code:-1});
        }
        if(row.count > 0){
            return cb({resp_code:-2});
        }
        sql = "INSERT INTO groups (name) VALUES(?);";
        db.run(sql, name, function(err){
            if(err){
                return cb({resp_code:-3});
            }
            var gid = this.lastID;
            cb({resp_code:0, gid:gid});
        });
    });
};

module.exports.del_group = function(cb, args){
    var  gid = args.gid;
    var sql = "SELECT COUNT(*) AS count FROM groups WHERE id = ? ;";
    db.get(sql, gid, function(err, row){
        if(err){
            return cb({resp_code:-1});
        }
        if(row.count == 0){
            return cb({resp_code:-2});
        }
        sql = "UPDATE contacts SET gid = 0 WHERE gid = ? ;";
        db.run(sql, gid);
        var sql1 = "DELETE FROM groups WHERE id = ? ;";
        db.run(sql1, gid, function(err){
            if(err){
                return cb({resp_code:-3});
            }else{
                return cb({resp_code:0});
            }
        });
    });
};

module.exports.edit_group = function(cb, args){
    var gid = args.gid;
    var name = args.name;
    var sql = "SELECT COUNT(*) AS count FROM groups WHERE id = ? ;";
    db.get(sql, gid, function(err, row){
        if(err){
            return cb({resp_code:-1});
        }
        if(row.count == 0){
            return cb({resp_code:-2});
        }
        sql = "UPDATE groups SET name = ? WHERE id = ? ;";
        db.run(sql, [name, gid], function(err){
            if(err){
                return cb({resp_code:-3, 'error':err});
            }
            cb({resp_code:0});
        });
    });
};

module.exports.del_person_batch = function(cb, args){
    var ids = args.ids;
    if(!ids || ids.length == 0){
        return cb({resp_code:-1});
    }
    var sql = "DELETE FROM contacts WHERE id in(";
    ids.map(function(d, i){
        sql += d;
        if(i+1 != ids.length){
            sql += ',';
        }
    });
    sql += ');'
    db.run(sql, function(err){
        if(err || this.changs == 0){
            cb(false);
        }else {
            cb(true);
        }
    });
};

module.exports.del_person = function(cb, args){
    var id = args.id;
    var sql = "DELETE FROM contacts WHERE id = ?;";
    db.run(sql, id, function(err){
        if(err || this.changs == 0){
            cb(false);
        }else {
            cb(true);
        }
    });
};

module.exports.add_person = function(cb, args){
    var mail = args.mail;
    var gid = args.gid;
    var sql = "SELECT *  FROM contacts WHERE mail = ? LIMIT 1;";
    db.get(sql, mail, function(err, row){
        if(err){
            return cb({resp_code:-1, error:err});
        }
        if(row){
            return cb({resp_code:-2, mail:row});
        }
        var sql = "INSERT INTO contacts (mail, gid) VALUES(?, ?);";
        db.run(sql, [mail, gid], function(err){
            if(err){
                return cb({resp_code:-3, error:err});
            }
            cb({resp_code:0, id:this.lastID});
        });
    });
};

module.exports.get_group_contacts_all = function(cb, args){
    var gid = args.gid;
    var sql = "SELECT * FROM contacts WHERE gid = ? ORDER BY id DESC;";
    db.all(sql, gid, function(err, rows){
        if(err){
            cb(false);
        }else{
            cb(rows);
        }
    });
};

module.exports.get_group_contacts = function(cb, args){
    var gid = args.gid;
    var offset = args.offset;
    var limit = args.limit;
    var sql = "SELECT * FROM contacts WHERE gid = ?  ORDER BY id DESC LIMIT ? OFFSET ? ;";
    db.all(sql, [gid, limit, offset], function(err, rows){
        if(err){
            return cb([]);
        }
        return cb(rows);
    });
};

module.exports.add_contents = function(cb, args){
    var title = args.title;
    var content = args.content;

    var sql = "INSERT INTO contents (title, content) VALUES(?, ?);";
    db.run(sql, [title, content], function(err){
        if(err){
            return cb({resp_code:-1});
        }
        cb({resp_code:0, id:this.lastID});
    });
};

module.exports.del_contents = function(cb, args){
    var cid = args.cid;
    var sql = 'DELETE FROM contents WHERE id = ? ;';
    db.run(sql, cid, function(err){
        if(err){
            cb(false);
        }else{
            cb(true);
        }
    });
}

module.exports.edit_contents = function(cb, args){
    var cid = args.cid;
    var data = args.data;
    var sql = null;
    var op = null;
    if(data.title && data.content){
        sql = 'UPDATE contents SET title = ? , content = ? WHERE id = ? ;';
        op = [data.title, data.content, cid];
    }else if(!data.title && data.content){
        sql = 'UPDATE contents SET  content = ? WHERE id = ? ;';
        op = [data.content, cid];
    }else{
        sql = 'UPDATE contents SET  title = ? WHERE id = ? ;';
        op = [data.title, cid];
    }

    db.run(sql, op,  function(err){
        console.log('edit_contents, error:', err, 'effect rows:', this.changs, 'sql:'+sql);
        if(err){
            cb(false);
        }else{
            cb(true);
        }
    });
};

module.exports.get_contents = function(cb){
    var sql = "SELECT * FROM contents;";
    db.all(sql, function(err, rows){
        if(err){
            cb({resp_code:-1, error:err});
        }else{
            cb({resp_code:0,cnts:rows});
        }
    }.bind(this));
};
var req_id = 1;
//var reqs = {};
var callback = function(ret){
    this.sender.send('db_resp', {reqid:this.reqid, data:ret}, this.reqid);
};

function db_req(event, arg){
    var rid = 'req-'+(req_id++);
    var req_obj = {
        reqid:rid,
        sender:event.sender
    };
    //reqs[req_id] = req_obj
    var handle = module.exports[arg.cmd];
    if(typeof handle != 'function'){
        event.returnValue = false;
    }else{
        event.returnValue = rid;
    }
    var cb = callback.bind(req_obj);
    handle(cb, arg.args);
}

module.exports.server_init = function(){
    electron.ipcMain.on('db_req', db_req);
};
