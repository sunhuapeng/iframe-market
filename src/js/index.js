let handleBtn = document.querySelector(".handle-btn");
let handleShow = document.querySelector(".handle-show");
let showClose = document.querySelector(".show-close");
let menu = document.querySelector(".menu");
let menuList = document.querySelector(".menu-list");
let menuListUl = document.querySelector(".menu-list>ul");

if (handleBtn && handleShow && showClose) {
  handleBtn.onclick = function () {
    handleShow.style.display = "block";
  };
  showClose.onclick = function () {
    handleShow.style.display = "none";
  };
  handleShow.onclick = function (e) {
    window.event ? (window.event.cancelBubble = true) : e.stopPropagation();
    e.stopPropagation();
  };
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
  menuList.onclick = function (ev) {
    var ev = ev || window.event;
    var li = ev.srcElement || ev.target;
    const lis = li.parentNode.parentNode.children;
    console.log(lis)
    if (li.nodeName === "SPAN") {
      if (lis) {
        for (let i = 0; i < lis.length; i++) {
          let l = lis[i].children[0]
          if(l) {
            l.classList.remove('icon-isactive')
          }
        }
      }
      li.classList.add("icon-isactive");
      window.$handleState = li.parentNode.classList[0]
    }
  };
}
