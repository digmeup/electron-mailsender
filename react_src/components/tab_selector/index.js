var React = require('react');

var TabSelector = React.createClass({
    render:funciton(){
        return (
            <ul class='tabs-wrap'>
                <li class='active tab'>
                    <div id="sendmail-tab" class="tab-item">
                        发信
                    </div>
                </li>
                <li class='tab'>
                    <div id="contacts-tab" class="tab-item">
                        联系人管理
                    </div>
                </li>
            </ul>
        );
    }
});

var

module.exports.TabSelector = TabSelector;
