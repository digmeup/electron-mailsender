// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var React = require('react');
var ReactDOM = require('react-dom');
var SendMail = require('components/sendmail');
var Contacts = require('components/contacts');
require('css/style.css');

var ViewWrap = React.createClass({
    getInitialState:function(){
        return {
            tab:'sendmail'
        };
    },

    onSendmailSel:function(){
        this.setState({tab:"sendmail"});
    },

    onContactsSel:function(){
        this.setState({tab:"contacts"});
    },

    render:function(){
        var sd_cls = 'tab';
        var sdct_cls = 'tab-content';
        var ct_cls = sd_cls;
        var ctct_cls = sdct_cls;
        if(this.state.tab == 'sendmail'){
            sd_cls += ' active';
            sdct_cls += ' active';
        }else if(this.state.tab == 'contacts'){
            ct_cls += ' active';
            ctct_cls += ' active';
        }
        return (
            <div>
                <div className="tabs">
                    <ul className='tabs-wrap'>
                        <li onClick={this.onSendmailSel} className={sd_cls}>
                            <div id="sendmail-tab" className="tab-item">
                                发信
                            </div>
                        </li>
                        <li  onClick={this.onContactsSel}  className={ct_cls}>
                            <div id="contacts-tab" className="tab-item">
                                联系人管理
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="tabs-wrap">
                    <div id="sendmail" className={sdct_cls}>
                        <SendMail />
                    </div>
                    <div id="contacts" className={ctct_cls}>
                        <Contacts />
                    </div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(<ViewWrap />, document.getElementById('container'));
