/**
 *@Auther: pangwei
 *@Last Editing time: 2018-03-06 19:29:52
 **/

/**
 * 防止命名冲突 模块化处理
 **/
var app = {};

app.util = {
    /**
     *选取元素
     **/
    $: function(selector, node) {
        return (node || document).querySelector(selector);
    },
    $$: function(selector, node) {
        return (node || document).querySelectorAll(selector);
    },
    /**
     *取得时间或根据传入时间戳得到时间
     **/
    getTime: function(ms) {
        ms = new Date(parseInt(ms) || Date.now());
        //格式化一位数   ‘1’ -> ‘01’
        var pad = function(str) {
            if ((str + '').length === 1) {
                return '0' + str;
            }
            return ''.concat(str);
        };
        var month = pad(ms.getMonth() + 1);
        var date = pad(ms.getDate());
        var hour = pad(ms.getHours());
        var min = pad(ms.getMinutes());
        var sec = pad(ms.getSeconds());
        return ms.getFullYear() + '/' + month + '/' +
            date + ' ' + hour + ' : ' + min + ' : ' + sec;
    },
    /**
     * 原型
     **/
    tpl: {
        upTpl: '▲',
        downTpl: '▼',
        titleTipTpl: '<span class="default-info">在这里输入标题</span>',
        contentTipTpl: '<span class="default-info">在这里输入内容</span>',
        noteTpl: '\
    <div class="info">\
    <div class="del-btn"></div>\
    <div class="title markedness" contenteditable="true"></div>\
    <div class="time">\
      <span class="markedness">修改时间: </span>\
      <span class="editing-time"></span>\
    </div>\
    <div class="arrow">\
      <a class="oc-btn" href="javascript:;" title="展开/收起">▼</a>\
    </div>\
    </div>\
    <hr class="split-line" />\
    <div class="content" contenteditable="true"></div>'
    }
};
/**
*   存储便签
*   格式：  {
                "key": "TinyNote", 
                "value":
                    {
                        id: {
                            title:"",
                            content:"",
                            time:"",
                            status:true,
                        },
                        id: content    
                    }
            }
**/
app.store = {
    __storageName: '__TinyNote__',
    saveNote: function(id, content) {
        var notesInfo = this.readNotesInfo();
        if (notesInfo[id]) {
            Object.assign(notesInfo[id], content);
        } else {
            notesInfo[id] = content;
        }
        localStorage[this.__storageName] = JSON.stringify(notesInfo || {});
    },
    getContent: function(id) {
        var notesInfo = this.readNotesInfo();
        return notesInfo[id] || {};
    },
    delNote: function(id) {
        var notesInfo = this.readNotesInfo();
        delete notesInfo[id];
        localStorage[this.__storageName] = JSON.stringify(notesInfo);
    },
    readNotesInfo: function() {
        return JSON.parse(localStorage[this.__storageName] || '{}');
    }
};
app.notesArray = new Array();

(function(util, store, notesArray) {
    var $ = util.$;
    var $$ = util.$$;

    /*
    *   给数组添加查找下标方法
    */
    Array.prototype.indexOf = function(value){
        for(var i = 0; i < this.length; i++){
            if(this[i] === value){
                return i;
            }
        }
        return -1;
    }


    /**
     * 便签对象的构造函数
     **/
    function Note(options) {
        options = options || {};

        this.timer = options.time || Date.now();
        this.status = options.status || 'unpacked';

        var tag = document.createElement('li');
        tag.className = 'note';
        tag.id = options.id || ('m-note-' + this.timer);
        tag.innerHTML = util.tpl.noteTpl;
        $('.m-note-container').insertBefore(tag, $('.m-note-container').firstChild);
        $('.title', tag).innerHTML = options.title || util.tpl.titleTipTpl;
        $('.content', tag).innerHTML = options.content || util.tpl.contentTipTpl;
        $('.editing-time', tag).innerHTML = util.getTime(this.timer);
        this.tag= tag;
        this.addEvent();

        if(this.status === 'unpacked'){
            this.unpack();
        } else {
            this.pack();
        }
    }
    /**
     *   保存
     **/
    Note.prototype.save = function() {
        store.saveNote(this.tag.id, {
            title: $('.title', this.tag).innerHTML,
            content: $('.content', this.tag).innerHTML,
            time: this.timer,
            status: this.status
        });
    }

    /**
     * 折起
     **/
    Note.prototype.pack = function() {
        var ocBtn = $('.oc-btn', this.tag);
        var content = $('.content', this.tag);
        var hr = $('.split-line', this.tag);
        ocBtn.innerHTML = util.tpl.upTpl;
        content.style.display = 'none';
        hr.style.display = 'none';
        this.status = 'packed';
        this.save();
    };
    /**
     * 展开
     **/
    Note.prototype.unpack = function() {
        var ocBtn = $('.oc-btn', this.tag);
        var content = $('.content', this.tag);
        var hr = $('.split-line', this.tag);
        ocBtn.innerHTML = util.tpl.downTpl;
        content.style.display = 'block';
        hr.style.display = 'block';
        this.status = 'unpacked';
        this.save();
    };
    /**
     * 添加事件方法
     **/
    Note.prototype.addEvent = function() {
        var title = $('.title', this.tag);
        var ocBtn = $('.oc-btn', this.tag);
        var delBtn = $('.del-btn', this.tag);
        var content = $('.content', this.tag);
        var time = $('.editing-time', this.tag);

        //折叠按钮事件
        var ocHandler = function(e) {
            if (ocBtn.innerHTML === util.tpl.downTpl) {
                this.pack();
            } else {
                this.unpack();
            }
        }.bind(this);
        ocBtn.addEventListener('click', ocHandler);

        //标题区和内容区 更改时间  保存信息
        var inputTimer;
        var inputHandler = function(e) {
            clearTimeout(inputTimer);
            var nowTime = Date.now();
            inputTimer = setTimeout(function() {
                time.innerHTML = util.getTime(nowTime);
            }, 300);
            this.timer = nowTime;
            this.save();
        }.bind(this);
        title.addEventListener('keyup', inputHandler);
        content.addEventListener('keyup', inputHandler);

        //标题区和 内容区  提示内容
        var titleTipClickHandler = function(e) {
            if (title.innerHTML === util.tpl.titleTipTpl) {
                title.innerHTML = '';
            }
        };
        var titleTipBlurHandler = function(e) {
            if (title.innerHTML === '') {
                title.innerHTML = util.tpl.titleTipTpl;
            }
        };
        title.addEventListener('click', titleTipClickHandler);
        title.addEventListener('blur', titleTipBlurHandler);

        var contentTipClickHandler = function(e) {
            if (this.innerHTML == util.tpl.contentTipTpl) {
                this.innerHTML = '';
            }
        };
        var contentTipBlurHandler = function(e) {
            if (this.innerHTML === '') {
                this.innerHTML = util.tpl.contentTipTpl;
            }
        };
        content.addEventListener('click', contentTipClickHandler);
        content.addEventListener('blur', contentTipBlurHandler);

        //删除事件
        var closeHandler = function(e) {
            var cfm = confirm("是否要彻底删除?");
            if (cfm) {
                //移除事件
                ocBtn.removeEventListener('click', ocHandler);
                title.removeEventListener('keyup', inputHandler);
                content.removeEventListener('keyup', inputHandler);
                title.removeEventListener('click', titleTipClickHandler);
                title.removeEventListener('blur', titleTipBlurHandler);
                content.removeEventListener('click', contentTipClickHandler);
                content.removeEventListener('blur', contentTipBlurHandler);
                delBtn.removeEventListener('click', closeHandler);
                //删除储存
                store.delNote(this.tag.id);
                //移除便签
                $('.m-note-container').removeChild(this.tag);
                var subscript = notesArray.indexOf(this);
                if(subscript !== -1){
                    notesArray.splice(subscript, 1);
                } else {
                    
                }
            }
        }.bind(this);
        delBtn.addEventListener('click', closeHandler);

    };

    document.addEventListener('DOMContentLoaded', function(e) {


        //添加标签
        var addNote = function(e) {
            var tmpNote = new Note();
            tmpNote.save();
            notesArray.push(tmpNote);
        }
        var addBtn = $('.add-btn');
        addBtn.addEventListener('click', addNote);


        /*
            全部展开  2018-03-14 17:48:38
        */
        var packAll = function(e) {
            notesArray.forEach(function(note){
                note.pack();
            });
        }
        var packAllBtn = $('.packAll');
        packAllBtn.addEventListener('click', packAll);

        /*
            全部收起  2018-03-14 17:48:52
        */
        var unpackAll = function(e) {
            notesArray.forEach(function(note){
                note.unpack();
            });
        }
        var unpackAllBtn = $('.unpackAll');
        unpackAllBtn.addEventListener('click', unpackAll);

        //平滑滚动
        var backBtn = $('.back-top');
        var backTop = function(e) {
            var heightTop = document.documentElement.scrollTop || document.body.scrollTop;
            var time = 250;
            var interval = 15;
            var step = time / interval;
            var distance = heightTop / step;

            var scrollTmp = function() {
                heightTop = heightTop - distance;
                window.scrollTo(0, heightTop);
                if (heightTop > 0) {
                    setTimeout(arguments.callee, interval);
                }
            };
            scrollTmp();
        };
        backBtn.addEventListener('click', backTop);

        /**
         *   根据存储建立相应便签
         **/
        var notes = store.readNotesInfo();
        var ids = Object.keys(notes);
        ids.forEach(function(id) {
            var tmpNote = new Note({
                id: id,
                time: notes[id].time,
                title: notes[id].title,
                content: notes[id].content,
                status: notes[id].status || "unpacked"
            });
            notesArray.push(tmpNote);
        });


        /**
         *   导航栏nav下拉菜单相关
         **/
        var navbar3 = $$(".lst")[2];
        var moreMune = $(".more-menu");
        var muneOverHandler = function(e) {
            moreMune.style.display = "block";
        };
        var muneOutHandler = function(e) {
            moreMune.style.display = "none";
        };
        var navOverHandler = function(e) {
            moreMune.style.display = "block";
        };
        var navOutHandler = function(e) {
            moreMune.style.display = "none";
        };

        moreMune.addEventListener("mouseover", muneOverHandler);
        moreMune.addEventListener("mouseout", muneOutHandler);
        navbar3.addEventListener("mouseover", navOverHandler);
        navbar3.addEventListener("mouseout", navOutHandler);
        
        /**
        *   滚动事件
        **/

        var scrollHandler = function(e) {
            var dis = document.documentElement.scrollTop || document.body.scrollTop;
            if(dis >= 400) {
                backBtn.style.display = "block";
            } else {
                backBtn.style.display = "none";
            }
        };
        document.addEventListener("scroll", scrollHandler);
    });

})(app.util, app.store, app.notesArray)