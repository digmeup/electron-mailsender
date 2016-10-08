var React = require('react');
require('./css/index.css');
var CntItem = require('./contents_item');

var ChkCntItem = React.createClass({

    onChange:function(){
        this.props.data.selected = this.refs.inp.checked;
    },
    componentDidMount:function(){
        if(this.props.data.selected){
            this.refs.inp.checked = true;
        }
    },
    render:function(){

        return (
            <div className="chk-cntitem">
                <input ref="inp" type="checkbox" onChange={this.onChange}/>
                <span>{this.props.data.title}</span>
            </div>
        )
    }
});

var SendMail = React.createClass({
    contents:[],
    num:1,
    inited:false,
    groups:[],
    getInitialState:function(){
        this.contents = contents;
        eventEmitter.on('groups_loaded', function(){
            console.log('groups loaded');
            this.groups = ct_groups;
            this.setState({});
        }.bind(this));
        return {send_status:'normal'};
    },

    onContentAdd:function(){
        this.contents.unshift({type:'add'});
        this.setState({ show_contents:true});
    },

    onRecListSel:function(e){
        console.log('receivers groups select:'+e.target.value);
    },

    componentDidMount:function(){
        if(localStorage.sender_mail){
            this.refs.send_mail.value = localStorage.sender_mail;
        }
        if(localStorage.smtp_pwd ){
            this.refs.smtp_pwd.value = localStorage.smtp_pwd ;
        }
        if(localStorage.sender_name){
            this.refs.send_name.value = localStorage.sender_name;
        }
        if(localStorage.send_interval){
            this.refs.send_interval.value = localStorage.send_interval;
        }
    },

    componentDidUpdate:function(){
        //console.log('receive group default select:'+this.refs.rec_group_list.value);
    },

    get_send_opts:function(){
        var data = {};
        var tmp = [];
        this.contents.map(function(d){
            if(!d || !d.id){
                return;
            }
            if(d.selected){
                tmp.push(d);
            }
        });
        if(tmp.length == 0){
            alert("还没选择发件内容！");
            return false;
        }
        data.contents = tmp;
        tmp = this.refs.send_mail.value;
        if(!tmp || !tmp.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/)){
            alert("请填写正确的邮件地址");
            return false;
        }
        data.sender = tmp;
        tmp = this.refs.smtp_pwd.value;
        if(!tmp){
            alert("请填写smtp密码");
            return false;
        }
        data.smtp_pwd = tmp;
        data.sender_name = this.refs.send_name.value;
        data.send_interval = this.refs.send_interval.value;

        tmp = this.refs.rec_group_list.value;
        this.groups.map(function(d){
            if(!d || !d.id){
                return false;
            }
            if(tmp == d.id){
                data.receive_group = d;
            }
        });
        if(!data.receive_group){
            alert("未选择收件人列表");
            return false;
        }
        return data;
    },

    onSendEnd:function(ret){
        console.log('onSendEnd', ret);
        if(ret.status == "FETCH_MAILS_FAILED"){
            this.log('本次发送失败，原因：获取收件人列表失败！');
        }else if(ret.status == 'MAILS_EMPTY'){
            this.log('本次发送失败，原因：该分组没有联系人');
        }else if(ret.status == 'DONE'){
            this.log('本次发送完成');
        }
        this.setState({send_status:'normal'});
    },

    onSendProgress:function(ret){
        console.log('onSendProgress', ret);
        if(ret.status == 'MAILS_SEND_FAILED'){
            var lg = ''
            for(var i = 0; i < ret.mails.length; i++){
                lg +='邮件："'+ret.mails[i].mail+'" 发送失败，原因：'+ret.error.response+"\n";
                this.log(lg);
            }

        }else if(ret.status == 'MAILS_SEND_DONE'){

        }
        this.refs.progress.innerText = ret.progress;
    },

    onSend:function(){
        var rt = false;
        if(this.state.send_status == 'sending'){
            return ;
        }else if(this.state.send_status == 'pause'){
            this.log("继续发送");
            rt = mailsender.continue(this.reqid);
            if(!rt){
                this.log("继续发送失败");
                return;
            }
        }else{
            var d = this.get_send_opts();
            if(!d){
                return;
            }
            console.log("get send opts:", d);
            this.send_opts = d;
            this.reqid = mailsender.send(d, this.onSendEnd, this.onSendProgress);
            this.log("开始发送");
            localStorage.sender_mail = d.sender;
            localStorage.send_interval = d.send_interval;
            localStorage.sender_name = d.sender_name;
            localStorage.smtp_pwd = d.smtp_pwd;
        }

        this.setState({send_status:'sending'});
    },

    onPause:function(){
        var ret = false;
        if(this.state.send_status != 'sending'){
            return;
        }
        this.log("暂停发送");
        ret = mailsender.pause(this.reqid);
        if(!ret){
            this.log("暂停发送失败");
            return;
        }
        this.setState({send_status:'pause'});
    },

    onCancel:function(){
        var ret = false;

        if(this.state.send_status == 'normal'){
            return;
        }
        this.log("取消发送");
        ret = mailsender.cancel(this.reqid);
        if(!ret){
            this.log("取消发送失败");
            return;
        }
        this.setState({send_status:'normal'});
    },

    log:function(msg){
        var d = new Date();
        var str = d.toLocaleDateString() + ' '+d.toLocaleTimeString() + " :"+msg+"\n";
        var tstr = this.refs.send_log.value + str;
        this.refs.send_log.value = tstr;
    },

    onSClick:function(){
        if(this.state.show_contents){
            this.setState({show_contents:false});
        }else{
            this.setState({show_contents:true});
        }
    },

    strip_content:function(data){
        this.contents.map(function(d, i){
            if(d == data){
                delete this.contents[i];
                this.setState({});
            }
        }.bind(this));
    },

    onCntDel:function(d){
        if(d.id){
            db.del_contents(d.id, function(ret){
                if(!ret){
                    alert('删除失败');
                    return;
                }
                this.strip_content(d);
            }.bind(this));
        }else{
            this.strip_content(d);
        }
    },

    onCntAdded:function(){
        this.setState({});
    },

    onCntEdited:function(){
        this.setState({});
    },

    render:function(){
        var cnts_view = null;
        var cover = (<div className="cover"></div>);
        var s_btn = null;
        var p_btn = null;
        var c_btn = null;
        if(this.state.send_status == 'normal'){
            p_btn = c_btn = 'disable';
            cover = null;
        }else if(this.state.send_status == 'sending'){
            s_btn = 'disable';
        }else if(this.state.send_status == 'pause'){
            p_btn = 'disable';
        }
        if(this.state.show_contents){
            cnts_view = this.contents.map(function(d, i){
                if(!d) return;
                return (
                    <CntItem onCntEdited={this.onCntEdited} onCntAdded={this.onCntAdded} onDel={this.onCntDel} data={d} key={this.num++} />
                );
            }.bind(this));
        }

        return (
            <div>
                {cover}
                <div className="mail-contents">
                    <div className="cnts-header">
                        <span>邮件内容管理</span>
                        <a onClick={this.onSClick}  href="javascript:;">{this.state.show_contents? '收起':'展开'}</a>
                        <a onClick={this.onContentAdd} href="javascript:;">添加</a>
                    </div>
                    <div className="cnts-body">
                        {cnts_view}
                    </div>
                </div>
                <div className="sender">
                    <div className="s-header">
                        <span>群发邮件</span>
                    </div>
                    <p>发件参数：</p>
                    <div className="s-opts">
                        <table><tbody>
                            <tr>
                                <td>收件人列表:</td>
                                <td>
                                    <select ref="rec_group_list" onChange={this.onRecListSel}>
                                        {this.groups.map(function(d){
                                            if(!d || !d.id){
                                                return ;
                                            }
                                            return (
                                                <option key={this.num++} value={d.id}>{d.name}</option>
                                            );
                                        }.bind(this))}
                                    </select>
                                </td>
                                <td>发送内容：</td>
                                <td><div>
                                    <p>选中的邮件将会随机选择发送</p>
                                    {this.contents.map(function(d){
                                        if(!d || !d.id){
                                            return;
                                        }
                                        return (
                                            <ChkCntItem key={this.num++} data={d}/>
                                        );
                                    }.bind(this))}
                                </div></td>
                            </tr>
                            <tr>
                                <td>发件人邮箱：</td>
                                <td><input ref="send_mail" type='text' /></td>
                                <td>smtp密码</td>
                                <td><input ref="smtp_pwd" type='password' /></td>
                            </tr>
                            <tr>
                                <td>发件人名称：</td>
                                <td><input ref="send_name" type="text" /></td>
                                <td>发送间隔时间</td>
                                <td><input ref="send_interval" type="number" /></td>
                            </tr>
                        </tbody></table>
                    </div>
                    <div className="send-btn">
                        <button onClick={this.onSend} className={s_btn}>开始发送</button>
                        <button onClick={this.onPause} className={p_btn}>暂停</button>
                        <button onClick={this.onCancel} className={c_btn}>取消</button>
                        <span className="send-progress" ref="progress"></span>
                    </div>
                    <div className="send_log">
                        <p>发送日志：</p>
                        <textarea ref="send_log"></textarea>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = SendMail;
