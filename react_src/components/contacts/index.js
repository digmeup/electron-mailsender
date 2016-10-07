var React = require('react');
var ContactsGroup = require('./contacts_group');
require('./css/index.css');

var Contacts = React.createClass({
    groups:[{id:0, name:"垃圾站"}],
    num:1,

    getInitialState:function(){
        db.get_groups(function(rows){
            if(rows && rows.length > 0){
                console.log('load from database:',rows);
                this.groups = rows;
                this.groups.push({id:0, name:"垃圾站"});
                this.setState({});
                ct_groups = rows;
                eventEmitter.emit('groups_loaded');
            }
        }.bind(this));
        return null;
    },

    onGroupSpreaded:function(group){
        this.groups.map(function(d){
            if(d != group && d.spread){
                delete d.mails;
                d.spread = false;
            }
        }.bind(this));
        this.setState({});
    },

    onAddClick:function(){
        var gid = 'tmp'+(this.num++);
        var data = {type:'add',tmpid:gid};
        this.groups.unshift(data);
        //this.groups.unshift();
        this.setState({update:true});
    },

    onAddResult:function(state, data){
        console.log('onAddResult:', state, data);
    },

    onDelClick:function(){
        //console.log('group datas:', this.groups);
        var checked = false;
        this.groups.map(function(d){
            if(d && d.checked){checked = true; return ;}
        });
        if(!checked){
            alert('还未选择分组！');
            return;
        }
        if(!prompt('提示','将要删除选择的分组, 分组中的联系人将会移动到“垃圾站”, 要继续吗？')){
            return;
        }
        this.groups.map(function(d, i){
            if(!d){
                return;
            }
            if(d.checked){
                db.del_group(d.id, function(ret){
                    if(ret.resp_code == 0){
                        delete this.groups[i];
                        this.setState({});
                    }else{
                        alert('分组："'+d.name+'" 删除失败！');
                    }
                }.bind(this));
            }
        }.bind(this));
    },

    render:function(){
        var group_views1 = [];
        var group_views2 = [];
        var n = 0;
        for(var i = 0; i < this.groups.length; i++){
            var d = this.groups[i];
            if(!d){
                continue;
            }
            var ref = 'cg_'+(d.type == 'add'? d.tmpid:d.id);
            if(n % 2){
                group_views2.push(<ContactsGroup onGroupSpreaded={this.onGroupSpreaded} ref={ref} data={d} onAddResult={this.onAddResult}  key={this.num++} />)
            } else {
                group_views1.push(<ContactsGroup onGroupSpreaded={this.onGroupSpreaded} ref={ref} data={d} onAddResult={this.onAddResult}  key={this.num++} />)
            }
            n++;
        }
        return (
            <div className="ct-wrap">
                <div className="add-group-wrap">
                    <button onClick={this.onDelClick}>删除分组</button>
                    <button onClick={this.onAddClick}>+添加分组</button>
                    <div className="divder">分组列表：</div>
                </div>

                <div className="cg-group-wrap">
                    <div className="cg-group-col">
                        {group_views1}
                    </div>
                    <div className="cg-group-col">
                        {group_views2}
                    </div>

                </div>
            </div>
        );
    }
});

module.exports = Contacts;
