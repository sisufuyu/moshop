(function($){
    var Dropdown = {}; 
    Dropdown.loadOnce = function($elem,successCallback){
        //only elem with 'data-load' attribute need lazy load. json file path in 'data-load'.
        var dataLoad = $elem.data('load');
        if(!dataLoad) return;
        //set 'data-loaded' to true after get data
        if(!$elem.data('loaded')){
            $.getJSON(dataLoad)
            .done(function(data){
                $elem.data('loaded',true);
                if(typeof successCallback === 'function'){
                    successCallback($elem,data);
                }
            })
            .fail(function(){
                $elem.data('loaded',false);
                console.log('failed to load dropdown data');
            })
        }
    }
    Dropdown.buildSiteItem = function($elem,data){
        var html = "",layer = $elem.find(".dropdown-layer");
        if(data.length === 0) return;
        $.each(data,function(index,value){
            var list = '<li><a href="'+value.url+'" target="_blank" class="site-item">'+value.name+'</a></li>';
            html += list;
        })
        layer.html(html);
        Dropdown.updateHeight($elem);
    }
    Dropdown.buildCartItem =function($elem,data){
        var cartNum = $elem.find("#cart-number");
        var $layer = $elem.find(".cart-layer");
        var html = "", num= 0, price = 0.00;
        //setTimeout(function(){
            html +="<li>最新加入的商品</li>"
            $.each(data,function(index,value){
                num += value.number;
                price += value.number * value.price;
                html += '<li class="cart-item"><img src="'+ value.src +'"><div class="item-title">' + value.name + '</div><div class="delete-btn">X</div><div class="item-detail">¥' + value.price + 'x' + value.number + '</div></li>';
            })
            html += '<li class="cart-item-total">共<b>' + num + '</b>件商品 共计<b>¥' + price + '</b><button class="goto-cart" type="button">去购物车</button></li>';
            $layer.html(html);
            cartNum.text(num);
            Dropdown.updateHeight($elem);
        //},1000);
    }
    Dropdown.buildCategoryItem =function($elem,data){
        var html = "";
        var $layer = $elem.find(".dropdown-layer");
        setTimeout(function(){
            $.each(data,function(index,value){
                html += '<dl class="category-detail cf"><dt class="category-detail-title fl"><a href="###" target="_blank" class="category-detail-title-link">' + value.title + '</a></dt><dd class="category-detail-item fl">';
                for(var i=0; i<value.items.length; i++){
                    html += '<a href="###" target="_blank" class="link">' + value.items[i] + '</a>';
                }
                html += '</dd></dl>';
            })
            $layer.html(html);
        },1000);
    }
    Dropdown.updateHeight = function($elem){
        var $layer = $elem.find("[class*='-layer']");
        $layer.height('auto');
        setTimeout(function(){
            $layer.height($layer.height());
        },200);
    }
    //dropdown menu in nav-site
    Dropdown.siteMenu = $(".nav-site .dropdown");
    Dropdown.siteMenu.on('dropdown-show',function(event){
        Dropdown.loadOnce($(this),Dropdown.buildSiteItem);
    })
    Dropdown.siteMenu.dropdown({
        css3:true,
        animation:'slideUpDown',
        event: 'hover',
        delay: 0
    });

    //search box
    var $headerSearch = $("#header-search");
    var maxNum = 10;
    $headerSearch.search({
        autocomplete: true,
        css3: false,
        js: true,
        animation: "fade"
    })
    $headerSearch.on('search-getData',function(event,data){
        console.log(data);
        // console.log(event.type);
        var $this = $(this);
        var html = createHeaderSearchLayer(data,maxNum);
        $this.search('appendLayer',html);
        if(html){
            $this.search('showLayer');
        }else{
            $this.search('hideLayer');
        }
    }).on('search-noData',function(event){
        var $this = $(this);
        $this.search('hideLayer').search('appenLayer','');
    }).on("click",".search-layer-item",function(){
        $headerSearch.search('setInputVal',$(this).html());
        $headerSearch.find("form").submit();
    })
    function createHeaderSearchLayer(data,maxNum){
        var html = "",
            dataNum = data['result'].length;
        if(dataNum === 0){
            return '';
        }
        for (var i=0; i< dataNum; i++){
            if(i >= maxNum) break;
            html += '<li class="search-layer-item text-ellipsis">'+data['result'][i][0]+"</li>";
        }
        return html;
    }
    
    //cart
    Dropdown.cart = $(".cart");
    Dropdown.cart.on("dropdown-show",function(){
        Dropdown.loadOnce(Dropdown.cart,Dropdown.buildCartItem);
    })
    Dropdown.cart.dropdown({
        css3:true,
        js:false,
        animation: 'slideUpDown'
    })

    //category
    Dropdown.category = $(".category .dropdown");
    Dropdown.category.each(function(index,elem){
        var $elem = $(elem);
        $elem.on("dropdown-show",function(){
            Dropdown.loadOnce($elem,Dropdown.buildCategoryItem);
        })
        $elem.dropdown({
            css3:false,
            js:false,
        })
    })

    var ImageLoader = {};
    // create a <img> label, load pic into user's computer in advance, increase web loading speed
    ImageLoader.loadImg =  function(url, imgLoaded, imgFailed){
        var image = new Image(); 
        image.onload = function(){
            if(typeof imgLoaded === 'function') imgLoaded(url);
        }
        image.onerror = function(){
            if(typeof imgFailed === 'function') imgFailed(url);
        }
        image.src = url;
    };
    ImageLoader.loadImgs = function($imgs,success,fail){
        $imgs.each(function(_,elem){
            var $img = $(elem);
            if($img.data('loaded') !== 'true'){
                ImageLoader.loadImg($img.data('src'),function(url){
                    $img.attr('src',url);
                    $img.data('loaded','true');
                    success();
                },function(url){
                    console.log('从'+url+'加载图片失败');
                    $img.data('loaded','false');
                    fail($img,url);
                });
            }
        })
    };

    var lazyLoad = {};
    // if elem is inside viewport, return true 
    lazyLoad.isVisible = function (offset,height){
        return ($win.height() + $win.scrollTop() > offset && $win.scrollTop() < offset + height);
    }
    lazyLoad.loadUntil = function(options){
        var loadedItemNum = 0, loadItemFn,
            totalItemNum = options.totalItemNum,
            $elem = options.$container,
            id = options.id,
            triggerEvent = options.triggerEvent;
        $elem.on(triggerEvent,loadItemFn = function(event,index,item){
            if($(item).data('loaded') !== 'true'){
                $elem.trigger(id+'-loadItems',[index,item,function(){
                    $(item).data('loaded','true');
                    loadedItemNum ++;
                    if(loadedItemNum === totalItemNum){
                        $elem.trigger(id+'-loaded');
                    }
                }]);
            }
        });
        $elem.on(id+'-loaded',function(){
            $elem.off(triggerEvent,loadItemFn);
        })
    };

    //focus-slider
    var Slider = {};

    //focus-slider
    Slider.$focusSlider =  $('#focus-slider');
    Slider.$focusSlider.on('focus-loadItems',function(event,index,item,success){
        var $imgs = $(item).find('.slider-img');
        ImageLoader.loadImgs($imgs,success,function($img,url){
            $img.attr('src','./img/focus-slider/placeholder.png');
        });
    });
    lazyLoad.loadUntil({
        $container: Slider.$focusSlider,
        totalItemNum: Slider.$focusSlider.find(".slider-img"),
        triggerEvent: "slider-show",
        id: 'focus'
    });
    Slider.$focusSlider.slider({
        css3: false,
        js: true,
        animation: 'slide',
        activeIndex: 0,
        interval: 0,
        loop: false
    });
    
    //todays-slider
    Slider.$todaysSlider =  $('#todays-slider');
    Slider.$todaysSlider.on('todays-loadItems',function(event,index,item,success){
        var $imgs = $(item).find('.slider-img');
        ImageLoader.loadImgs($imgs,success,function($img,url){
            $img.attr('src','./img/todays-slider/placeholder.png');
        });
    });
    lazyLoad.loadUntil({
        $container: Slider.$todaysSlider,
        totalItemNum: Slider.$todaysSlider.find(".slider-img"),
        triggerEvent: "slider-show",
        id: 'todays'
    });
    Slider.$todaysSlider.slider({
        css3: false,
        js: true,
        animation: 'slide',
        activeIndex: 0,
        interval: 0,
        loop: false
    });

    //floor
    var floor = {};
    floor.$floor = $('.floor');
    floor.floorData = [
        {
            num: 1, //floor number
            offset: floor.$floor.eq(0).offset().top, //element relative position to document
            height: floor.$floor.eq(0).height(),
            panels: [[
                {
                    name: '匡威男棒球开衫外套2015',
                    price: 479
                }, {
                    name: 'adidas 阿迪达斯 训练 男子',
                    price: 335
                }, {
                    name: '必迈BMAI一体织跑步短袖T恤',
                    price: 159
                }, {
                    name: 'NBA袜子半毛圈运动高邦棉袜',
                    price: 65
                }, {
                    name: '特步官方运动帽男女帽子2016',
                    price: 69
                }, {
                    name: 'KELME足球训练防寒防风手套',
                    price: 4999
                }, {
                    name: '战地吉普三合一冲锋衣',
                    price: 289
                }, {
                    name: '探路者户外男士徒步鞋',
                    price: 369
                }, {
                    name: '羽绒服2015秋冬新款轻薄男士',
                    price: 399
                }, {
                    name: '溯溪鞋涉水鞋户外鞋',
                    price: 689
                }, {
                    name: '旅行背包多功能双肩背包',
                    price: 269
                }, {
                    name: '户外旅行双肩背包OS0099',
                    price: 99
                }
            ],[
                {
                    name: '匡威男棒球开衫外套2015',
                    price: 479
                }, {
                    name: 'adidas 阿迪达斯 训练 男子',
                    price: 335
                }, {
                    name: '必迈BMAI一体织跑步短袖T恤',
                    price: 159
                }, {
                    name: 'NBA袜子半毛圈运动高邦棉袜',
                    price: 65
                }, {
                    name: '特步官方运动帽男女帽子2016',
                    price: 69
                }, {
                    name: 'KELME足球训练防寒防风手套',
                    price: 4999
                }, {
                    name: '战地吉普三合一冲锋衣',
                    price: 289
                }, {
                    name: '探路者户外男士徒步鞋',
                    price: 369
                }, {
                    name: '羽绒服2015秋冬新款轻薄男士',
                    price: 399
                }, {
                    name: '溯溪鞋涉水鞋户外鞋',
                    price: 689
                }, {
                    name: '旅行背包多功能双肩背包',
                    price: 269
                }, {
                    name: '户外旅行双肩背包OS0099',
                    price: 99
                }
            ],[
                {
                    name: '匡威男棒球开衫外套2015',
                    price: 479
                }, {
                    name: 'adidas 阿迪达斯 训练 男子',
                    price: 335
                }, {
                    name: '必迈BMAI一体织跑步短袖T恤',
                    price: 159
                }, {
                    name: 'NBA袜子半毛圈运动高邦棉袜',
                    price: 65
                }, {
                    name: '特步官方运动帽男女帽子2016',
                    price: 69
                }, {
                    name: 'KELME足球训练防寒防风手套',
                    price: 4999
                }, {
                    name: '战地吉普三合一冲锋衣',
                    price: 289
                }, {
                    name: '探路者户外男士徒步鞋',
                    price: 369
                }, {
                    name: '羽绒服2015秋冬新款轻薄男士',
                    price: 399
                }, {
                    name: '溯溪鞋涉水鞋户外鞋',
                    price: 689
                }, {
                    name: '旅行背包多功能双肩背包',
                    price: 269
                }, {
                    name: '户外旅行双肩背包OS0099',
                    price: 99
                }
            ]]
        },
        {
            num: 2,
            offset: floor.$floor.eq(1).offset().top,
            height: floor.$floor.eq(1).height(),
            panels: [
                [{
                    name: '韩束红石榴鲜活水盈七件套装',
                    price: 169
                }, {
                    name: '温碧泉八杯水亲亲水润五件套装',
                    price: 198
                }, {
                    name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                    price: 79.9
                }, {
                    name: '吉列手动剃须刀锋隐致护',
                    price: 228
                }, {
                    name: 'Mediheal水润保湿面膜',
                    price: 119
                }, {
                    name: '纳益其尔芦荟舒缓保湿凝胶',
                    price: 39
                }, {
                    name: '宝拉珍选基础护肤旅行四件套',
                    price: 299
                }, {
                    name: '温碧泉透芯润五件套装',
                    price: 257
                }, {
                    name: '玉兰油多效修护三部曲套装',
                    price: 199
                }, {
                    name: 'LOREAL火山岩控油清痘洁面膏',
                    price: 36
                }, {
                    name: '百雀羚水嫩倍现盈透精华水',
                    price: 139
                }, {
                    name: '珀莱雅新柔皙莹润三件套',
                    price: 99
                }],
                [{
                    name: '韩束红石榴鲜活水盈七件套装',
                    price: 169
                }, {
                    name: '温碧泉八杯水亲亲水润五件套装',
                    price: 198
                }, {
                    name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                    price: 79.9
                }, {
                    name: '吉列手动剃须刀锋隐致护',
                    price: 228
                }, {
                    name: 'Mediheal水润保湿面膜',
                    price: 119
                }, {
                    name: '纳益其尔芦荟舒缓保湿凝胶',
                    price: 39
                }, {
                    name: '宝拉珍选基础护肤旅行四件套',
                    price: 299
                }, {
                    name: '温碧泉透芯润五件套装',
                    price: 257
                }, {
                    name: '玉兰油多效修护三部曲套装',
                    price: 199
                }, {
                    name: 'LOREAL火山岩控油清痘洁面膏',
                    price: 36
                }, {
                    name: '百雀羚水嫩倍现盈透精华水',
                    price: 139
                }, {
                    name: '珀莱雅新柔皙莹润三件套',
                    price: 99
                }],
                [{
                    name: '韩束红石榴鲜活水盈七件套装',
                    price: 169
                }, {
                    name: '温碧泉八杯水亲亲水润五件套装',
                    price: 198
                }, {
                    name: '御泥坊红酒透亮矿物蚕丝面膜贴',
                    price: 79.9
                }, {
                    name: '吉列手动剃须刀锋隐致护',
                    price: 228
                }, {
                    name: 'Mediheal水润保湿面膜',
                    price: 119
                }, {
                    name: '纳益其尔芦荟舒缓保湿凝胶',
                    price: 39
                }, {
                    name: '宝拉珍选基础护肤旅行四件套',
                    price: 299
                }, {
                    name: '温碧泉透芯润五件套装',
                    price: 257
                }, {
                    name: '玉兰油多效修护三部曲套装',
                    price: 199
                }, {
                    name: 'LOREAL火山岩控油清痘洁面膏',
                    price: 36
                }, {
                    name: '百雀羚水嫩倍现盈透精华水',
                    price: 139
                }, {
                    name: '珀莱雅新柔皙莹润三件套',
                    price: 99
                }]
            ]
        },
        {
            num: 3,
            offset: floor.$floor.eq(2).offset().top,
            height: floor.$floor.eq(2).height(),
            panels: [
                [{
                    name: '摩托罗拉 Moto Z Play',
                    price: 3999
                }, {
                    name: 'Apple iPhone 7 (A1660)',
                    price: 6188
                }, {
                    name: '小米 Note 全网通 白色',
                    price: 999
                }, {
                    name: '小米5 全网通 标准版 3GB内存',
                    price: 1999
                }, {
                    name: '荣耀7i 海岛蓝 移动联通4G手机',
                    price: 1099
                }, {
                    name: '乐视（Le）乐2（X620）32GB',
                    price: 1099
                }, {
                    name: 'OPPO R9 4GB+64GB内存版',
                    price: 2499
                }, {
                    name: '魅蓝note3 全网通公开版',
                    price: 899
                }, {
                    name: '飞利浦 X818 香槟金 全网通4G',
                    price: 1998
                }, {
                    name: '三星 Galaxy S7（G9300）',
                    price: 4088
                }, {
                    name: '华为 荣耀7 双卡双待双通',
                    price: 1128
                }, {
                    name: '努比亚(nubia)Z7Max(NX505J)',
                    price: 728
                }],
                [{
                    name: '摩托罗拉 Moto Z Play',
                    price: 3999
                }, {
                    name: 'Apple iPhone 7 (A1660)',
                    price: 6188
                }, {
                    name: '小米 Note 全网通 白色',
                    price: 999
                }, {
                    name: '小米5 全网通 标准版 3GB内存',
                    price: 1999
                }, {
                    name: '荣耀7i 海岛蓝 移动联通4G手机',
                    price: 1099
                }, {
                    name: '乐视（Le）乐2（X620）32GB',
                    price: 1099
                }, {
                    name: 'OPPO R9 4GB+64GB内存版',
                    price: 2499
                }, {
                    name: '魅蓝note3 全网通公开版',
                    price: 899
                }, {
                    name: '飞利浦 X818 香槟金 全网通4G',
                    price: 1998
                }, {
                    name: '三星 Galaxy S7（G9300）',
                    price: 4088
                }, {
                    name: '华为 荣耀7 双卡双待双通',
                    price: 1128
                }, {
                    name: '努比亚(nubia)Z7Max(NX505J)',
                    price: 728
                }],
                [{
                    name: '摩托罗拉 Moto Z Play',
                    price: 3999
                }, {
                    name: 'Apple iPhone 7 (A1660)',
                    price: 6188
                }, {
                    name: '小米 Note 全网通 白色',
                    price: 999
                }, {
                    name: '小米5 全网通 标准版 3GB内存',
                    price: 1999
                }, {
                    name: '荣耀7i 海岛蓝 移动联通4G手机',
                    price: 1099
                }, {
                    name: '乐视（Le）乐2（X620）32GB',
                    price: 1099
                }, {
                    name: 'OPPO R9 4GB+64GB内存版',
                    price: 2499
                }, {
                    name: '魅蓝note3 全网通公开版',
                    price: 899
                }, {
                    name: '飞利浦 X818 香槟金 全网通4G',
                    price: 1998
                }, {
                    name: '三星 Galaxy S7（G9300）',
                    price: 4088
                }, {
                    name: '华为 荣耀7 双卡双待双通',
                    price: 1128
                }, {
                    name: '努比亚(nubia)Z7Max(NX505J)',
                    price: 728
                }]
            ]
        },
        {
            num: 4,
            offset: floor.$floor.eq(3).offset().top,
            height: floor.$floor.eq(3).height(),
            panels: [
                [{
                    name: '暴风TV 超体电视 40X 40英寸',
                    price: 1299
                }, {
                    name: '小米（MI）L55M5-AA 55英寸',
                    price: 3699
                }, {
                    name: '飞利浦HTD5580/93 音响',
                    price: 2999
                }, {
                    name: '金门子H108 5.1套装音响组合',
                    price: 1198
                }, {
                    name: '方太ENJOY云魔方抽油烟机',
                    price: 4390
                }, {
                    name: '美的60升预约洗浴电热水器',
                    price: 1099
                }, {
                    name: '九阳电饭煲多功能智能电饭锅',
                    price: 159
                }, {
                    name: '美的电烤箱家用大容量',
                    price: 329
                }, {
                    name: '奥克斯(AUX)936破壁料理机',
                    price: 1599
                }, {
                    name: '飞利浦面条机 HR2356/31',
                    price: 665
                }, {
                    name: '松下NU-JA100W 家用蒸烤箱',
                    price: 1799
                }, {
                    name: '飞利浦咖啡机 HD7751/00',
                    price: 1299
                }],
                [{
                    name: '暴风TV 超体电视 40X 40英寸',
                    price: 1299
                }, {
                    name: '小米（MI）L55M5-AA 55英寸',
                    price: 3699
                }, {
                    name: '飞利浦HTD5580/93 音响',
                    price: 2999
                }, {
                    name: '金门子H108 5.1套装音响组合',
                    price: 1198
                }, {
                    name: '方太ENJOY云魔方抽油烟机',
                    price: 4390
                }, {
                    name: '美的60升预约洗浴电热水器',
                    price: 1099
                }, {
                    name: '九阳电饭煲多功能智能电饭锅',
                    price: 159
                }, {
                    name: '美的电烤箱家用大容量',
                    price: 329
                }, {
                    name: '奥克斯(AUX)936破壁料理机',
                    price: 1599
                }, {
                    name: '飞利浦面条机 HR2356/31',
                    price: 665
                }, {
                    name: '松下NU-JA100W 家用蒸烤箱',
                    price: 1799
                }, {
                    name: '飞利浦咖啡机 HD7751/00',
                    price: 1299
                }],
                [{
                    name: '暴风TV 超体电视 40X 40英寸',
                    price: 1299
                }, {
                    name: '小米（MI）L55M5-AA 55英寸',
                    price: 3699
                }, {
                    name: '飞利浦HTD5580/93 音响',
                    price: 2999
                }, {
                    name: '金门子H108 5.1套装音响组合',
                    price: 1198
                }, {
                    name: '方太ENJOY云魔方抽油烟机',
                    price: 4390
                }, {
                    name: '美的60升预约洗浴电热水器',
                    price: 1099
                }, {
                    name: '九阳电饭煲多功能智能电饭锅',
                    price: 159
                }, {
                    name: '美的电烤箱家用大容量',
                    price: 329
                }, {
                    name: '奥克斯(AUX)936破壁料理机',
                    price: 1599
                }, {
                    name: '飞利浦面条机 HR2356/31',
                    price: 665
                }, {
                    name: '松下NU-JA100W 家用蒸烤箱',
                    price: 1799
                }, {
                    name: '飞利浦咖啡机 HD7751/00',
                    price: 1299
                }]
            ]
        },
        {
            num: 5,
            offset: floor.$floor.eq(4).offset().top,
            height: floor.$floor.eq(4).height(),
            panels: [
                [{
                    name: '戴尔成就Vostro 3800-R6308',
                    price: 2999
                }, {
                    name: '联想IdeaCentre C560',
                    price: 5399
                }, {
                    name: '惠普260-p039cn台式电脑',
                    price: 3099
                }, {
                    name: '华硕飞行堡垒旗舰版FX-PRO',
                    price: 6599
                }, {
                    name: '惠普(HP)暗影精灵II代PLUS',
                    price: 12999
                }, {
                    name: '联想(Lenovo)小新700电竞版',
                    price: 5999
                }, {
                    name: '游戏背光牧马人机械手感键盘',
                    price: 499
                }, {
                    name: '罗技iK1200背光键盘保护套',
                    price: 799
                }, {
                    name: '西部数据2.5英寸移动硬盘1TB',
                    price: 419
                }, {
                    name: '新睿翼3TB 2.5英寸 移动硬盘',
                    price: 849
                }, {
                    name: 'Rii mini i28无线迷你键盘鼠标',
                    price: 349
                }, {
                    name: '罗技G29 力反馈游戏方向盘',
                    price: 2999
                }],
                [{
                    name: '戴尔成就Vostro 3800-R6308',
                    price: 2999
                }, {
                    name: '联想IdeaCentre C560',
                    price: 5399
                }, {
                    name: '惠普260-p039cn台式电脑',
                    price: 3099
                }, {
                    name: '华硕飞行堡垒旗舰版FX-PRO',
                    price: 6599
                }, {
                    name: '惠普(HP)暗影精灵II代PLUS',
                    price: 12999
                }, {
                    name: '联想(Lenovo)小新700电竞版',
                    price: 5999
                }, {
                    name: '游戏背光牧马人机械手感键盘',
                    price: 499
                }, {
                    name: '罗技iK1200背光键盘保护套',
                    price: 799
                }, {
                    name: '西部数据2.5英寸移动硬盘1TB',
                    price: 419
                }, {
                    name: '新睿翼3TB 2.5英寸 移动硬盘',
                    price: 849
                }, {
                    name: 'Rii mini i28无线迷你键盘鼠标',
                    price: 349
                }, {
                    name: '罗技G29 力反馈游戏方向盘',
                    price: 2999
                }],
                [{
                    name: '戴尔成就Vostro 3800-R6308',
                    price: 2999
                }, {
                    name: '联想IdeaCentre C560',
                    price: 5399
                }, {
                    name: '惠普260-p039cn台式电脑',
                    price: 3099
                }, {
                    name: '华硕飞行堡垒旗舰版FX-PRO',
                    price: 6599
                }, {
                    name: '惠普(HP)暗影精灵II代PLUS',
                    price: 12999
                }, {
                    name: '联想(Lenovo)小新700电竞版',
                    price: 5999
                }, {
                    name: '游戏背光牧马人机械手感键盘',
                    price: 499
                }, {
                    name: '罗技iK1200背光键盘保护套',
                    price: 799
                }, {
                    name: '西部数据2.5英寸移动硬盘1TB',
                    price: 419
                }, {
                    name: '新睿翼3TB 2.5英寸 移动硬盘',
                    price: 849
                }, {
                    name: 'Rii mini i28无线迷你键盘鼠标',
                    price: 349
                }, {
                    name: '罗技G29 力反馈游戏方向盘',
                    price: 2999
                }]
            ]
        }
    ]
    floor.buildFloorBody = function (floorData){
        var floorNum = floorData.num,
            panelNum = floorData.panels.length,
            itemNum = floorData.panels[0].length,
            html = '';
        for(var i=0; i< panelNum; i++){
            html += '<ul class="tab-panel">';
            for(var j=0; j<itemNum; j++){
                html += '<li class="floor-item fl"><p class="floor-item-pic"><a href="###" target="_blank"><img src="img/floor/loading.gif" class="floor-img" data-src="img/floor/'
                        + floorNum + '/' + (i+1) + '/' + (j+1) +'.png" alt="" /></a></p><p class="floor-item-name"><a href="###" target="_blank" class="link">'
                        + floorData.panels[i][j].name +'</a></p><p class="floor-item-price">￥'
                        + floorData.panels[i][j].price +'</p></li>';
            }
           html += '</ul>';
        }
        return html;
    }
    floor.$floor.on('tab-loadItems',function(event,index,item,success){
        var $imgs = $(item).find('.floor-img');
        ImageLoader.loadImgs($imgs,success,function($img,url){
            $img.attr('src','./img/floor/placeholder.png');
        });
    })

    $win = $(window);
    $doc = $(document);
    //lazy load floor
    floor.timeToshow = function(){
        //console.log('time to show');
        floor.$floor.each(function(index,elem){
            if(lazyLoad.isVisible(floor.floorData[index].offset,floor.floorData[index].height)){
                //console.log('the ' + (index+1) + ' floor visible');
                $doc.trigger('floor-show',[index,elem]);
            }
        })
    }
    $doc.on('floor-loadItems',function(event,index,item,success){
        var html = floor.buildFloorBody(floor.floorData[index]), $item = $(item);
        $item.find('.floor-body').html(html);
        lazyLoad.loadUntil({
            $container: $item,
            totalItemNum: $item.find(".floor-img").length,
            triggerEvent: 'tab-show',
            id: 'tab'
        })
        $item.tab({
             event: 'mouseenter',
             css: false,
             js: false,
             animation: 'fade',
             activeIndex: 0,
             interval: 0,
             delay: 500
        });
        success();
    }).on('floor-loaded',function(){
        $win.off('scroll resize',floor.showFloor);
    })
    lazyLoad.loadUntil({
        $container: $doc,
        totalItemNum: floor.$floor.length,
        triggerEvent: 'floor-show',
        id: 'floor'
    });
    $win.on('scroll resize',floor.showFloor = function(){
        clearTimeout(floor.floorTimer);
        floor.floorTimer = setTimeout(floor.timeToshow,250);
    });
    floor.whichFloor = function(){
        var num = -1;
        floor.$floor.each(function(index,elem){
            num = index;
            //If floor is on the bottom half of viewport, set floor number = index -1
            if($win.scrollTop() + $win.height()/2 < floor.floorData[index].offset){
                num = index-1;
                return false;
            }
        })
        return num;
    }

    //elevator, click elevator jump to corresponding floor
    var elevator ={};
    elevator.lift = $('.elevator');
    elevator.$items = elevator.lift.find(".elevator-item");
    elevator.calculateLeft = function(){
        elevator.offset = floor.$floor.find('.container').offset().left-40;
        elevator.lift.css('left',elevator.offset);
    }
    $win.on('resize',elevator.calculateLeft);
    elevator.calculateLeft();
    elevator.setElevator = function(){
        var num = floor.whichFloor();
        if(num === -1){
            elevator.lift.fadeOut();
        }else{
            elevator.lift.fadeIn();
            elevator.$items.removeClass('elevator-item-active');
            elevator.$items.eq(num).addClass('elevator-item-active');
        }
    }
    $win.on('scroll resize',function(){
        clearTimeout(elevator.timer);
        elevator.timer = setTimeout(elevator.setElevator,250);
    })
    elevator.lift.on('click','.elevator-item',function(){
        var index = elevator.$items.index(this);
        $('html,body').animate({
            scrollTop: floor.floorData[index].offset
        });
    })

    //back to top
    $("#backToTop").on('click',function(){
        $('html,body').animate({
            scrollTop: 0
        });
    })

    //footer
    var footer={};
    footer.bottom = $(".nav-bottom");
    footer.bottomData = [
        {
            title: '消费者保障',
            item: ['保障范围','退货退款流程','服务中心','更多特色服务']
        },
        {
            title: '新手上路',
            item: ['新手专区','消费警示','交易安全','24小时在线帮助','免费开店']
        },
        {
            title: '付款方式',
            item: ['快捷支付','信用卡','余额包','蜜蜂花啊','货到付款']
        },
        {
            title: '慕淘特色',
            item: ['手机慕淘','慕淘信','大众评审','B格指南']
        },
    ]
    // lazy load bottom
    footer.loadBottomBlock = function(bottomData){
        var html = "";
        for(var i=0; i<bottomData.length; i++){
            html += '<div class="nav-bottom-block"><p class="nav-block-title">' + bottomData[i].title + '</p>';
            for(var j=0; j<bottomData[i].item.length; j++){
                html += '<a href="javascript:;" class="nav-block-item">' + bottomData[i].item[j] + '</a>';
            }
            html += '</div>';
        }
        return html;
    }
    footer.timeToshow = function(){
        if(lazyLoad.isVisible(footer.bottom.offset().top,footer.bottom.height())){
            //setTimeout(function(){
                //console.log('load bottom')
                footer.bottom.html(footer.loadBottomBlock(footer.bottomData));
                footer.bottom.trigger('bottom-loaded');
            //},1000);
        }
    }
    $win.on('scroll resize',footer.showBottom = function(){
        clearTimeout(footer.timer);
        footer.timer = setTimeout(footer.timeToshow,250);
    })
    footer.bottom.on('bottom-loaded',function(){
        $win.off('scroll resize',footer.showBottom);
    })
    
})(jQuery);

