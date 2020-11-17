let handleBtn: any = document.querySelector(".handle-btn");
let handleShow: any = document.querySelector(".handle-show");
let massageBox: any = document.querySelector(".massage-box");
let showClose: any = document.querySelector(".show-close");
let showMain: any = document.querySelector(".show-main");
let menu: any = document.querySelector(".menu");
let menuList: any = document.querySelector(".menu-list");
let menuListUl: any = document.querySelector(".menu-list>ul");

if (handleBtn && handleShow && showClose && massageBox) {
  showClose.onclick = function () {
    massageBox.style.display = "none";
    (window as any).unRay = false
  };
  handleBtn.onclick = function () {
    showMessage(`
    <p>商场</p>
    <p>激活后，恢复场景默认状态，显示所有楼层</p>
    <br />
    <p>楼层</p>
    <p>激活后，通过点击楼层模型显示楼层详情信息</p>
    <br />
    <p>店铺</p>
    <p>激活后，通过点击地图模型上已有店铺查看店铺详情信息</p>
    <br />
    <p>路线</p>
    <p>
      激活后，通过点击动图模型上的已有店铺，计算头像位置到达店铺的路线（未规范具体可行走路线，识别无店铺模型的位置皆为可行走路线）
    </p>
    <br />
    <p>搜索</p>
    <p>调用搜索框，可对店铺进行搜索</p>
    <br />
    <p>说明书</p>
    <p>打开此说明书</p>`)
  };
  // 菜单按钮点击事件
  let menuIsClick = true;
  menu.onclick = function () {
    if (menuIsClick) {
      menuList.classList.add("menu-list-open");
    } else {
      menuList.classList.remove("menu-list-open");
      menu.classList.remove("icon-isactive");
    }
    menuIsClick = !menuIsClick;
  };
  // 菜单列表点击事件委托
  menuList.onclick = function (ev) {
    var ev = ev || window.event;
    var li = ev.srcElement || ev.target;
    const lis = li.parentNode.parentNode.children;
    if (li.nodeName === "SPAN") {
      if (lis) {
        for (let i = 0; i < lis.length; i++) {
          let l = lis[i].children[0]
          if (l) {
            l.classList.remove('icon-isactive')
          }
        }
      }
      if(li.parentNode.classList[0] === 'market') {
        (window as any).mkt.controls.reset ()
      }
      li.classList.add("icon-isactive");
      (window as any).$handleState = li.parentNode.classList[0]
    }
  };
}
function showMessage(html) {
  (window as any).unRay = true
  massageBox.style.display = "block";
  let innerHTML = html
  showMain.innerHTML = innerHTML
} 
export {showMessage}