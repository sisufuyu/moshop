(function($){
    var transition = window.mt.transition;
    function init($elem,hiddenCallback){
        if($elem.is(':hidden')){//Check if $elem is hidden
            $elem.data('status','hidden');
            if(typeof hiddenCallback === 'function') hiddenCallback();
        }else{
            $elem.data('status','shown');
        }
    }
    function show($elem,callback){
        if($elem.data('status') === 'show' || $elem.data('status') === 'shown') return;
        $elem.data('status','show').trigger('show');
        callback();
    }
    function hide($elem,callback){
        if($elem.data('status') === 'hide' || $elem.data('status') === 'hidden') return;
        $elem.data('status','hide').trigger('hide');
        callback();
    }
    // show and hide with no animation
    var silent = {
        init: init,
        show: function($elem){
            show($elem,function(){
                $elem.show();
                $elem.data('status','shown').trigger('shown');
            });
        },
        hide: function($elem){
            hide($elem,function(){
                $elem.hide();
                $elem.data('status','hidden').trigger('hidden');
            })
        }
    }

    //show and hide with css animation -> transition
    var css3 = {
        fade: {
            init: function($elem){
                $elem.addClass('transition');
                init($elem,function(){ 
                    $elem.addClass('fadeOut');
                });
            },
            show:function ($elem) {
                css3._show($elem,'fadeOut');
            },
            hide:function ($elem) {
               css3._hide($elem,'fadeOut');
            }
        },
        slideUpDown: {
            init: function($elem){
                $elem.height($elem.height());
                css3._init($elem,function () {
                    $elem.addClass('sildeUpDownCollapse');
                });
            },
            show:function ($elem){
                css3._show($elem,'sildeUpDownCollapse');
            },
            hide: function($elem){
                css3._hide($elem,'sildeUpDownCollapse');
            }
        },
        slideLeftRight: {
            init: function($elem){
                $elem.width($elem.width());
                css3._init($elem,function () {
                    $elem.addClass('sildeLeftRightCollapse')
                });
            },
            show: function($elem){
                css3._show($elem,'sildeLeftRightCollapse');
            },
            hide: function($elem){
                css3._hide($elem,'sildeLeftRightCollapse');
            }
        },
        fadeSlideUpDown: {
            init: function($elem){
                $elem.height($elem.height());
                css3._init($elem,function () {
                    $elem.addClass('fadeOut sildeUpDownCollapse');
                });
            },
            show: function($elem){
                css3._show($elem,'fadeOut sildeUpDownCollapse');
            },
            hide: function($elem){
                css3._hide($elem,'fadeOut sildeUpDownCollapse');
            }
        },
        fadeSlideLeftRight: {
            init: function($elem){
                $elem.width($elem.width());
                css3._init($elem,function () {
                    $elem.addClass('fadeOut sildeLeftRightCollapse')
                });
            },
            show: function($elem){
                css3._show($elem,'fadeOut sildeLeftRightCollapse');
            },
            hide: function($elem){
                css3._hide($elem,'fadeOut sildeLeftRightCollapse');
            }
        }
    }
    css3._init = function($elem,callback){
        $elem.addClass("transition");
        init($elem,callback);
    }
    css3._show = function($elem,className){
        show($elem,function(){
            $elem.off(transition.end).one(transition.end,function () {
                $elem.data('status','shown').trigger('shown');
            })
            $elem.show();
            setTimeout(function(){
                $elem.removeClass(className);
            },20);
            
        })
    }
    css3._hide = function($elem,className){
        hide($elem,function(){
            $elem.off(transition.end).one(transition.end,function () { 
                $elem.hide();
                $elem.trigger('hidden');
            })
            $elem.addClass(className);
        })
    }

    // show and hide use jQuery animate
    var js = {
        fade:{
            init: function($elem){
                init($elem);
            },
            show: function($elem){
                js._show($elem,'fadeIn');
            },
            hide: function($elem){
                js._hide($elem,'fadeOut');
            }
        },
        slideUpDown: {
            init: function($elem){
                init($elem);
            },
            show: function($elem){
                js._show($elem,'slideDown')
            },
            hide: function($elem){
                js._hide($elem,'slideUp');
            }
        },
        slideLeftRight: {
            prop: {'width':0,'padding-left':0,'padding-right':0},
            init: function($elem){
                js._init($elem,this.prop);
            },
            show: function($elem){
                js._show1($elem);
            },
            hide:function($elem){
                js._hide1($elem,this.prop);
            }
        },
        fadeSlideUpDown: {
            prop: {'opacity':0,'height':0,'padding-top':0,'padding-bottom':0},
            init: function($elem){
                js._init($elem,this.prop);
            },
            show: function($elem){
                js._show1($elem);
            },
            hide: function($elem){
                js._hide1($elem,this.prop);
            }
        },
        fadeSlideLeftRight: {
            prop: {'opacity':0,'width':0,'padding-left':0,'padding-right':0},
            init: function($elem){
                js._init($elem,this.prop);
            },
            show: function($elem){
                js._show1($elem);
            },
            hide: function($elem){
                js._hide1($elem,this.prop);
            }
        }
    }
    js._init = function($elem,prop){
        var styles = {};
        for(key in prop){
            styles[key]=$elem.css(key);
        }
        $elem.data('styles',styles);
        init($elem,function(){
            $elem.css(prop);
        })
    }
    js._show = function($elem,callback){
        show($elem,function(){
                $elem.stop()[callback]('slow',function(){
                $elem.data('status','shown').trigger('shown');
            })
        })
    }
    js._hide = function($elem,callback){
        hide($elem,function(){
            $elem.stop()[callback]('slow',function(){
                $elem.data('status','hidden').trigger('hidden');
            });
        })
    }
    js._show1 = function($elem){
        show($elem,function(){
            var styles = $elem.data('styles');
            $elem.show();
            $elem.stop().animate(styles,"slow",function(){
                $elem.data('status','shown').trigger('shown');
            });
        })
    }
    js._hide1 = function($elem,prop){
        hide($elem,function(){
            $elem.stop().animate(prop,"slow",function(){
                $elem.hide();
                $elem.data('status','hidden').trigger('hidden');
            });
        })
    }
    
    var defaults={
        css3: false,
        js:false,
        animation: 'fade'
    }
    function showHide($elem,options){
        var mode = null;
        var params = $.extend({},defaults,options);
        if(params.css3 && transition.isSupport){
            mode = css3[params.animation] || css3[defaults.animation];
        }else if(params.js){
            mode = js[params.animation] || js[defaults.animation];
        }else{
            mode = silent;
        }
        mode.init($elem);
        return{
            show: $.proxy(mode.show,mode,$elem),
            hide: $.proxy(mode.hide,mode,$elem)
        }
    }
    $.fn.extend({
        showhide:function(options){
            return this.each(function(){
                var $this = $(this), 
                    params = $.extend({},defaults,typeof options === 'object' && options),
                    mode = $this.data('showHide');
                if(!mode){
                    mode = showHide($this,params);
                    $this.data('showHide',mode);
                }
                if(typeof mode[options] === 'function'){
                    mode[options]();
                }
            })
        }
    })
})(jQuery);