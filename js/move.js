(function($){
    'use strict';

    var init = function($elem){
        this.$elem = $elem;
        this.curX = parseFloat(this.$elem.css('left'));
        this.curY = parseFloat(this.$elem.css('top'));
    }
    var to = function(x,y,callback){
        x = (typeof x === 'number') ? x : this.curX;
        y = (typeof y === 'number') ? y : this.curY;
        if(this.curX === x && this.curY === y) return;
        this.$elem.trigger('move',[this.$elem]);
        if(typeof callback=== 'function'){
            callback();
        } 
        this.curX = x;
        this.curY = y;
    }
    var transitionEnd =  window.mt.transition.end;
    var isSupport =  window.mt.transition.isSupport;

    var Silent = function($elem){
        init.call(this,$elem);
        this.$elem.remove('transition');
    }
    Silent.prototype.to = function(x,y){
        var elem = this.$elem;
        to.call(this,x,y, function(){
            elem.css({
                "left": x,
                "top": y
            });
            elem.trigger('moved',[elem])
        })
    };
    Silent.prototype.toX = function(x){
        this.to(x,this.curY);
    };
    Silent.prototype.toY = function(y){
        this.to(this.curX,y);
    };

    var Css3 = function($elem){
        init.call(this,$elem);
        this.$elem.addClass('transition');
        this.$elem.css({
            left: this.curX,
            top: this.curY
        })
    }
    Css3.prototype.to = function(x,y){
        console.log(1)
        var elem = this.$elem;
        to.call(this, x, y, function(){
            elem.off(transitionEnd).one(transitionEnd,function(){
                elem.trigger('moved',[elem]);
            })
            elem.css({
                "left": x,
                "top": y
            });
        })
    }
    Css3.prototype.toX = function(x){
        this.to(x);
    }
    Css3.prototype.toY = function(y){
        this.to(null,y);
    }

    var Js = function($elem){
        init.call(this,$elem);
        this.$elem.removeClass('transition');
    }
    Js.prototype.to = function(x,y){
        var elem = this.$elem;
        to.call(this, x, y, function(){
            elem.stop().animate({
                left: x,
                top: y
            },function(){
                elem.trigger('moved',[elem]);
            })
        });
    }
    Js.prototype.toX = function(x){
        this.to(x);
    }
    Js.prototype.toY = function(y){
        this.to(null,y);
    }

    var defaults = {
        css3: false,
        js: false
    }
    var move = function($elem,options){
        var mode= null;
        if(options.css3 && isSupport){
            console.log(1);
            mode = new Css3($elem);
        }else if(options.js){
            mode = new Js($elem);
        }else{
            mode = new Silent($elem);
        }
        return {
            to: $.proxy(mode.to,mode),
            toX: $.proxy(mode.toX,mode),
            toY: $.proxy(mode.toY,mode)
        }
    }
    
    $.fn.extend({
        move:function(options, x, y){
            return this.each(function(){
                var $this = $(this), 
                    params = $.extend({},defaults,options),
                    mode = $this.data('move');
                if(!mode){
                    mode = move($this,params);
                    $this.data('move',mode);
                }
                if(typeof mode[options] === 'function'){
                    mode[options](x, y);
                }
            })
        }
    })
})(jQuery);