var React = require('react');
require('./css/contact_item.css');

var ContactItem = React.createClass({
    data:{},
    num:1,
    getInitialState:function(){
        var st = null;
        var d = this.props.data;
        this.data = d;
        if(d && d.type == 'add'){
            st = {st:'newer'};
        }else{
            st = {st:'normal'};
        }
        return st;
    },

    onSaveClick:function(){
        var mail = this.refs.mail.innerText;
        if(!mail || !mail.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/)){
            return alert('请填写正确的邮箱地址');
        }
        db.add_person(mail, this.props.group.id, function(ret){
            if(ret.resp_code < 0){
                switch(ret.resp_code){
                    case -2:
                        alert('该地址已添加');
                        break;
                    case -1:
                    case -3:
                        alert('添加失败：'+JSON.stringify(ret.error));
                        break;
                    default:
                        alert('添加失败!');
                        break;
                }
            }else{
                this.data.mail = mail;
                this.data.id = ret.id;
                this.data.type = 'added';
                this.setState({st:'normal'});
            }
        }.bind(this));
    },

    onDelClick:function(){
        this.props.onItemDel(this.data);
    },

    onItemSel:function(){
        this.data.checked = this.refs.inp.checked;
    },

    componentDidMount:function(){
        if(this.data.checked){
            this.refs.inp.checked = this.data.checked;
        }
    },

    render:function(){
        var editable = null;
        var editcss = null;
        var mail = this.data.mail;

        var del_btn = (<a onClick={this.onDelClick} href="javascript:;">删除</a>);
        var edit_btn = (<a href="javascript:;">修改</a>);
        var save_btn = (<a onClick={this.onSaveClick} href="javascript:;">保存</a>);
        var move_btn = (<a href="javascript:;">移动</a>);

        if(this.state.st == 'newer'){
            editable = 'true';
            editcss = 'mail-editable';
            mail = '';
            edit_btn = move_btn = null;
        }
        return (
            <div className="ct-item">
                <input onChange={this.onItemSel} ref="inp" type="checkbox" />
                <span ref="mail" className={editcss} contentEditable={editable}>{mail}</span>
                <div className="ct-item-btns">
                    {del_btn}{edit_btn}{save_btn}{move_btn}
                </div>
            </div>
        );
    }
});

module.exports = ContactItem;
