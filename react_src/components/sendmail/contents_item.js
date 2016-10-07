var React = require('react');
require('./css/contents_item.css');

var CntItem = React.createClass({
    getInitialState:function(){
        this.data = this.props.data;
        if(this.data.type == 'add'){
            return {st:'add'};
        }else{
            return {st:'normal'};
        }
    },

    componentDidMount:function(){
        if(this.state.st != 'add'){
            this.refs.title.value = this.data.title;
            this.refs.content.value = this.data.content;
        }
    },

    onSaveClick:function(){
        var title = this.refs.title.value;
        var content = this.refs.content.value;
        if(this.state.st == 'add'){
            if(!title || !content){
                return alert("邮件标题和邮件正文不能为空");
            }
            db.add_contents(title, content, function(ret){
                if(ret.resp_code < 0){
                    alert('添加失败！');
                }else{
                    this.data.id = ret.id;
                    this.data.title = title;
                    this.data.content  = content;
                    this.data.type = 'added';
                    alert("保存成功");
                    //this.setState({st:'normal'});
                    this.props.onCntAdded();
                }
            }.bind(this));
        }else if(this.state.st == 'edit'){
            if(!title || !content){
                return alert("邮件标题和邮件正文不能为空");
            }
            var d = null;
            if(title != this.data.title){
                d = {};
                d.title = title;
            }
            if(content != this.data.content){
                if(!d) d = {};
                d.content = content;
            }
            if(!d){
                alert('没有修改，无需保存！');
                this.setState({st:'normal'});
                return;
            }
            db.edit_contents(this.data.id, d, function(ret){
                console.log('edit_contents ret:id',this.data.id, 'data:', d, 'ret', ret);
                if(ret){
                    alert('修改成功');
                    if(d.content){
                        this.data.content = d.content;
                    }
                    if(d.title){
                        this.data.title = d.title;
                        this.props.onCntEdited(this.data);
                    }else{
                        this.setState({st:'normal'});
                    }
                }else{
                    alert('修改失败');
                }
            }.bind(this));
        }
    },

    onMClick:function(){
        this.setState({st:'edit'});
    },

    onDClick:function(){
        this.props.onDel(this.data);
    },

    render:function(){
        var title = null;
        var disabled = null;
        var m_btn = (<a onClick={this.onMClick} href="javascript:;">修改</a>);
        var del_btn = (<a onClick={this.onDClick} href="javascript:;">删除</a>);
        var save_btn = (<a onClick={this.onSaveClick} href="javascript:;">保存</a>);
        if(this.state.st == 'add'){
            m_btn = del_btn = null;
        }else if(this.state.st == 'normal'){
            disabled = 'disabled';
            save_btn = null;
        }else if(this.state.st == 'edit'){

        }
        if(this.data.title){
            title = this.data.title;
        }
        return (
            <div className="cnt-item">
                <div className="cnt-header">
                    <span>{title}</span>
                    {m_btn}{del_btn}{save_btn}
                </div>
                <div className="cnt-body">
                    <div className="cnt-title">
                        <input disabled={disabled} ref="title" type='text' placeholder="邮件标题"/>
                    </div>
                    <div className="cnt-content">
                        <textarea disabled={disabled} ref="content" placeholder="请输入邮件正文"></textarea>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = CntItem;
