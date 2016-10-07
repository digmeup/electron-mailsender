var React = require('react');
require('./css/contacts_group.css');
var ContactItem = require('./contact_item');

var LIMIT = 20;

/*
<ContactItem />
<ContactItem />
<ContactItem />
<ContactItem />
<ContactItem />
<ContactItem />
*/

var MailGroup = React.createClass({

    data:{},
    num:1,
    getInitialState:function(){
        var state = null;
        var d = this.props.data;
        this.data = d;
        if(d && d.type == 'add'){
            state = {state:'newer'};
        }else{
            state={state:'normal'};
        }
        return state;
    },

    onSaveClick:function(){
        var cg_name = this.refs.cg_name.innerText;
        if(!cg_name){
            return alert('分组名为空');
        }
        if(cg_name == "垃圾站"){
            show_msg('抱歉', '该分组名已被系统保留！');
            return;
        }
        console.log("cg name:"+cg_name);
        if(this.state.state == 'newer'){
            db.add_group(cg_name, function(ret){
                console.log(ret);
                if(ret.resp_code < 0){
                    this.props.onAddResult('failed', this.data);
                    switch(ret.resp_code){
                        case -1:
                            alert("系统错误，创建失败！");
                            break;
                        case -2:
                            alert("该分组名已分配, 请另取名字!");
                            break;
                        default:
                            alert("创建失败！");
                    }
                }else{
                    this.data.id = ret.gid;
                    this.data.name = cg_name;
                    this.data.type = 'added';
                    this.setState({state:'normal'});
                    this.props.onAddResult('ok', this.data);
                }
            }.bind(this));
        }else if(cg_name != this.data.name){
            console.log('will edit group');
            db.edit_group(this.data.id, cg_name, function(ret){
                console.log('edit group result:', ret);
                if(ret.resp_code == 0){
                    console.log('修改成功');
                    this.data.name = cg_name;
                    this.setState({state:'normal'});
                }else{

                }
            }.bind(this));
        }else{
            this.setState({state:'normal'});
        }

    },

    onEditClick:function(){
        this.setState({state:'edit'});
    },

    onAddClick:function(){
        if(!this.data.mails){
            this.data.mails = [];
        }
        this.data.mails.unshift({type:'add',tmpid:('tmp'+this.num++), gid:this.data.id});
        this.setState({});
    },

    onCGSel:function(e){
        //console.log('checked:',e.target.checked);
        this.data.checked = e.target.checked;
    },

    onSPDClick:function(){
        if(this.data.spread == true){
            return;
        }
        db.get_group_contacts(this.data.id, 0, LIMIT, function(ret){
            if(ret.length > 0){
                if(!this.data.mails){
                    this.data.mails = [];
                }
                ret.map(function(d, i){
                    this.data.mails.push(d);
                }.bind(this));
                this.data.spread = true;
                this.props.onGroupSpreaded(this.data);
            }
        }.bind(this));
    },

    onLoadMore:function(){
        if(!this.data.mails){
            return;
        }
        var len = this.data.mails.length;
        db.get_group_contacts(this.data.id, len, LIMIT, function(ret){
            if(ret.length > 0){
                if(!this.data.mails){
                    this.data.mails = [];
                }
                ret.map(function(d, i){
                    this.data.mails.push(d);
                }.bind(this));
                this.setState({});
            }
        }.bind(this));
    },

    save_mail:function(){
        var d = this.import_mails[this.import_pos];
        db.add_person(d, this.data.id, function(ret){
            this.import_pos++;
            if(ret.resp_code < 0){
                switch(ret.resp_code){
                    case -2:
                        alert('邮件："'+d+'"已添加，将被忽略');
                        break;
                    case -1:
                    case -3:
                        alert('邮件："'+d+'"添加失败：'+JSON.stringify(ret.error));
                        break;
                    default:
                        alert('邮件："'+d+'"添加失败，未知原因');
                        break;
                }
            }else{
                this.import_ok++;
                if(this.import_ok < 60){
                    this.data.mails.unshift({mail:d, id:ret.id, gid:this.data.id});
                }
                if(this.refs.ldlg_mail){
                    this.refs.ldlg_mail.innerText = d;
                    this.refs.ldlg_prog.innerText = this.import_ok+'/'+this.import_mails.length;
                }
            }
            if(this.import_pos >= this.import_mails.length){
                if(this.data.spread){
                    this.setState({show_ldlg:false});
                }else{
                    this.data.spread = true;
                    this.props.onGroupSpreaded(this.data);
                }
            }else{
                setTimeout(this.save_mail, 0);
            }
        }.bind(this));
    },

    onImportClick:function(){
        var imp = window.require('./lib/import');
        var mails = imp.import_mails_from_csv();
        if(!mails){
            return;
        }else if(mails && mails.length == 0){
            alert('该文件为空');
        }
        if(!this.data.mails){
            this.data.mails = [];
        }
        this.import_mails = mails;
        this.import_pos = 0;
        this.import_ok = 0;
        this.setState({show_ldlg:true});
        this.save_mail();
    },

    strip_mail:function(mail){
        this.data.mails.map(function(d, i){
            if(mail == d){
                delete this.data.mails[i];
            }
        }.bind(this));
        this.setState({});
    },

    onItemDel:function(data){
        if(data.id){
            db.del_person(data.id, function(ret){
                if(!ret){
                    alert("删除失败！");
                }else{
                    this.strip_mail(data);
                }
            }.bind(this));
        }else{
            this.strip_mail(data);
        }
    },

    batch_strip_mail:function(){
        this.data.mails.map(function(d, i){
            if(!d || !d.checked){
                return;
            }
            delete this.data.mails[i];
        }.bind(this));
        this.setState({});
    },

    onBtDel:function(){
        if(!this.data.mails){
            alert('未选择邮件');
            return;
        }
        var del_num = 0;
        var del_ids = [];
        this.data.mails.map(function(d, i){
            if(!d || !d.checked ){
                return;
            }
            if(d.id){
                del_ids.push(d.id);
            }
            del_num++;
        }.bind(this));
        if(del_num == 0){
            return alert('未选择邮件');
        }
        if(del_ids.length > 0){
            db.del_person_batch(del_ids, function(ret){
                if(!ret){
                    return alert('批量删除失败！');
                }
                this.batch_strip_mail();
            }.bind(this));
        }else{
            this.batch_strip_mail();
        }
    },

    render:function(){
        var editable = null;
        var editcss = null;
        var cg_name = this.data.name;
        var spd_btn = (<a onClick={this.onSPDClick} href="javascript:;">展开</a>);
        var bm_btn = (<a href="javascript:;">批量移动</a>);
        var edit_btn = (<a onClick={this.onEditClick} href="javascript:;">修改</a>);
        var save_btn = (<a onClick={this.onSaveClick} href="javascript:;">保存</a>);
        var bd_btn = (<a onClick={this.onBtDel} href="javascript:;">批量删除</a>);
        var ld_btn = (<a onClick={this.onImportClick} href="javascript:;">导入</a>);
        var add_btn = (<a onClick={this.onAddClick} href="javascript:;">添加</a>);
        if(this.state.state == 'newer'){
            editable = 'true';
            editcss = 'cg-editable';
            cg_name = '';
            bm_btn = edit_btn = bd_btn = ld_btn = add_btn = spd_btn = null;
        }else if(this.state.state == 'normal'){
            save_btn = null;
        }else if(this.state.state == 'edit'){
            editable = 'true';
            editcss = 'cg-editable';
            edit_btn = null;
        }

        var mails_view = null;
        if(this.data.mails){
            mails_view = this.data.mails.map(function(d,i){
                if(!d) return;
                var ref = 'cit_'+(d.type == 'add'? d.tmpid:d.id);
                return (<ContactItem onItemDel={this.onItemDel} data={d} group={this.data} key={this.num++} ref={ref} />);
            }.bind(this));
        }

        var load_dlg = null;
        if(this.state.show_ldlg){
            load_dlg = (
                <div className="imp-prog">
                    <div className="imp-dlg">
                        <p><span>正在导入：</span><em ref="ldlg_mail"></em><b ref="ldlg_prog"></b></p>
                    </div>
                </div>
            );
        }

        return (
            <div className="contacts-group">
                {load_dlg}
                <div className="cg-header">
                    {this.data.id == 0? null:<input checked={/*this.data.checked*/false? 'checked':null}  onChange={this.onCGSel} type="checkbox" />}
                    <span ref="cg_name" className={editcss} contentEditable={editable}>{cg_name}</span>
                    <div className="cg-btns">
                        {bm_btn}{this.data.id == 0? null:edit_btn}
                        {save_btn}{bd_btn}{ld_btn}{add_btn}{spd_btn}
                    </div>
                </div>
                <div className="cg-body">
                    {mails_view}
                    {this.data.spread? <p onClick={this.onLoadMore} className="cg-loadmore"><span>加载更多...</span></p>:null}
                </div>
            </div>
        );
    }
});

module.exports = MailGroup;
