var CSV = require('./csv');


module.exports.import_mails_from_csv  = function(){
    var p = electron.remote.dialog.showOpenDialog({properties:['openFile']});
    if(!p){
        return false;
    }
    p = p[0];
    console.log('will open file:'+p);
    var ct = fs.readFileSync(p, 'utf8');
    if(!ct){
        return [];
    }
    var mails = (new CSV(ct)).parse();
    var nmails = [];
    mails.map(function(d, i){
        if(!d[0].match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/)){
            alert("非法邮件格式："+d);
        }else{
            nmails.push(d[0]);
        }
    });
    return nmails;
};
