// 引入公共样式
require("../style/index.less");
require('../js/handle-dom.ts')
// 设置rem比例
document.documentElement.style.fontSize = Math.min(window.innerWidth, 750) / 750 * 100 + 'px';

let isMobile: any = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
const loading: any = document.querySelector('.loading')
if (!isMobile) {
    // document.body.style.width = '750px'
}

// 引入three文件
const Market = require("../market/index");

// 初始化3D项目
const win: any = window
const mkt: any = new Market.default()

win.mkt = mkt
mkt.render()