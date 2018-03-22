var canvas = {};

canvas.util = {
    $: function(tag, node) {
        return (node || document).querySelector(tag);
    },
    random: function(min, max) {
        switch (arguments.length) {
            case 1:
                return Math.random() * arguments[0];
            case 2:
                return Math.random() * arguments[1] - arguments[0];
            default:
                return Math.random() > 0.5 ? -1 : 1;
        }
    },
    zone: {
        width: window.innerWidth ,
        height: window.innerHeight
    },
    length: 70
};

(function(util) {
    var $ = util.$;

    function Dot(width, height) {
        this.changeZone(width, height);
        this.posX = util.random(width);
        this.posY = util.random(height);
        this.dirX = util.random();
        this.dirY = util.random();
        this.velX = util.random(1, 3);
        this.velY = util.random(1, 3);
    }

    Dot.prototype = {
        constructor: Dot,
        move: function() {
            this.rebound();
            this.posX += this.dirX * this.velX;
            this.posY += this.dirY * this.velY;
        },
        rebound: function() {
            if (this.posX < 0 || this.posX > this.width) {
                this.dirX *= -1;
            }
            if (this.posY < 0 || this.posY > this.height) {
                this.dirY *= -1;
            }
        },
        changeZone: function(width, height) {
            this.width = width;
            this.height = height;
        }

    };

    //存储点的数据结构
    var dots = new Array();

    for (var i = 0; i < util.length; i++) {
        dots[i] = new Dot(util.zone.width, util.zone.height);
    }

    document.addEventListener("DOMContentLoaded", function() {
        var cvs = $("#bg");
        cvs.width = util.zone.width;
        cvs.height = util.zone.height;


    });

    var cvs = $("#bg");

    cvs.paintDot = function(posX, posY) {
        if (this.getContext) {
            var ctt = this.getContext('2d');
            ctt.beginPath();
            ctt.arc(posX, posY, 0.5, 0, 2 * Math.PI);
            ctt.closePath();
            ctt.fill();
        }
    };

    cvs.clear = function() {
        if (this.getContext) {
            var ctt = this.getContext('2d');
            ctt.clearRect(0, 0, util.zone.width, util.zone.height);
        }
    };

    cvs.paintLine = function() {
        for (var m = 0; m < dots.length; m++) {
            for (var n = m + 1; n < dots.length; n++) {
                var distence = Math.pow((dots[m].posX - dots[n].posX), 2) + Math.pow((dots[m].posY - dots[n].posY), 2);
                if(distence <= 22500){
                	var ctt = this.getContext('2d');
                	ctt.beginPath();
                	ctt.lineWidth = 0.2;
                	ctt.moveTo(dots[m].posX, dots[m].posY);
                	ctt.lineTo(dots[n].posX, dots[n].posY);
                	ctt.stroke();
                	ctt.closePath();
                }
            }
        }
    }

    cvs.step = function() {
        cvs.clear();
        cvs.paintLine();
        dots.forEach(function(dot) {
            cvs.paintDot(dot.posX, dot.posY);         
            dot.move();
        });   
    };

    setInterval(cvs.step, 40);


})(canvas.util)