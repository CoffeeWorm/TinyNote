/*
 *	@function:添加每个便签的事件
 *	@time:2018-02-13 18:41:36
 */
function eventInit() {
    ////获取标题元素
    var title = document.getElementsByClassName('title');
    ////获取内容元素
    var content = document.getElementsByClassName("content");
    ////获取删除按钮
    var delBtn = document.getElementsByClassName("del-btn");
    ////获取内容隐藏展示按钮
    var ocBtn = document.getElementsByClassName("oc-btn");
    ////向下箭头模型
    var upArrow = "▲";
    var downArrow = "▼";
    ////获取便签元素
    var note = document.getElementsByClassName("memo");

    for (var i = 0; i < title.length; i++) {

        /*默认提示信息在点击时消失*/
        title[i].onclick = function() {
            this.innerHTML = "";
        };
        content[i].onclick = function() {
            this.innerHTML = "";
        };

        /*
        *若没有输入信息离开输入窗口恢复提示信息
		*同时修改编辑时间 
        */
        content[i].onblur = function() {
            if (this.innerHTML == "") {
                this.innerHTML = '<span class="default-info">Please  input content here.</span>';
            }
			this.parentNode.firstElementChild.childNodes[5].childNodes[3].innerHTML = new Date();
        };
        title[i].onblur = function() {
            if (this.innerHTML == "") {
                this.innerHTML = '<span class="default-info">Please input title here.</span>';
            }
            this.parentNode.parentNode.firstElementChild.childNodes[5].childNodes[3].innerHTML = new Date();
        };

        /*删除便签事件*/
        delBtn[i].onclick = function() {
            if (confirm("确定后内容将被永久删除")) {
                var tmp = this.parentNode.parentNode;
                tmp.parentNode.removeChild(tmp);
            }
        };

        /*折叠内容事件*/
        ocBtn[i].onclick = function() {
            ////该便签的内容节点
            var tmpContent = this.parentNode.parentNode.parentNode.lastElementChild;
            ////找到hr节点
            var hrElement = this.parentNode.parentNode.parentNode.childNodes[2];
            var hrStyle = hrElement.style.display;
            if (hrStyle == "" || hrStyle == "block") {
                hrElement.style.display = "none";
                tmpContent.style.display = "none";
                this.innerHTML = upArrow;
            } else {
                hrElement.style.display = "block";
                tmpContent.style.display = "block";
                this.innerHTML = downArrow;
            }
        };
    }
}
/*添加便签*/
//1、获取添加按钮
var add = document.getElementsByClassName("add-btn")[0];
//2、获取添加便签的元素
var note = document.getElementsByClassName("m-note-container")[0];
//3、给按钮添加事件
add.onclick = function() {
    ////(1)获取原有便签信息
    var tmp = note.innerHTML;
    ////(2)便签模版
    var mod = `<li class="memo"><div class="info">
                    <div class="del-btn"></div>
                    <div class="title markedness" contenteditable="true">
                        <span class="default-info">Please input title here.</span>
                    </div>
                    <div class="time">
                        <span class="markedness">Editing time: </span>
                        <span class="out-time">`+ new Date()+`</span>
                    </div>
                    <div class="arrow">
                        <a class="oc-btn" href="javascript:;">▼</a>
                    </div>
                </div>
                <hr class="split-line" />
                <div class="content" contenteditable="true">
                    <span class="default-info">Please  input content here.</span>
                </div>
            </li>`;
    ////(3)将新便签添加到原有便签上面
    note.innerHTML = mod + tmp;
    ////(4)给便签添加事件
    eventInit();
};
/*End 添加便签*/

/*返回顶层的事件*/
////获取返回顶层元素
var backTop = document.getElementsByClassName("back-top")[0];
////添加事件
backTop.onclick = function() {
	console.log(backTop.offsetLeft);
    window.scrollTo(0, 0);
};
/*End 返回顶层*/