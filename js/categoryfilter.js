/**
 * Author:mochyli@163.com
 * Date:2018-10-26 
 */
 (function ($) {     
    //初始化绑定事件
    $.fn.extend({
    	categoryfilter: function (ops) {
    		if (typeof (arguments[0]) != typeof ("string")) {
    			return $.fn.categoryfilter.methods["init"](this, ops);
    		} else {
    			return $.fn.categoryfilter.methods[arguments[0]](this, arguments);
    		}
    	}
    });

    //方法
    $.fn.categoryfilter.methods = {
    	options: function (target) {
    		var opts = $(target).data("categoryfilter").options;
    		return opts;
    	},
        UrlValue: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); 
            return null;
        },
        postUrl: function(options){ //解析url参数添加到objData[]
            var $this = this;
            var val   = $this.UrlValue('eval');
            var obj   = {};
            var arr   = [];
            var objData = [];

            if (val) {
                var x = {};
                val.split("^").forEach(function(g,i){
                    var r = g.split("_");
                    x['name'] = r[0];
                    x['id'] = r[1].replace(/\|/g, ',');
                    arr.push(JSON.parse(JSON.stringify(x)));
                });
            };
            $.each(arr,function(i,o){
                var id = o.id.split(",");
                $.each(options.data,function(key,value){
                    if(value.name==o.name){
                        value.display = false;
                        obj.title = value.title;
                        obj.name = value.name;
                        obj.id = o.id;
                        obj.value = '';
                        obj.data  = [];
                        $.each(value.data,function(k,m){
                            id.forEach(function(a, b){
                                if(m.id==a) {
                                    obj.data.push(m);
                                    obj.value += m.value + '、';
                                }
                            });
                        });
                        obj.value = obj.value.substring(0,obj.value.length-1);
                    }
                });
                objData.push(JSON.parse(JSON.stringify(obj)));
            });
            return objData;
        },
    	init: function (target, ops) {  //添加基础框架，
    		var $this   = this;
    		var options = $.extend({}, $.fn.categoryfilter.defaults, ops);
            var countArr = [];
    		$(target).data("categoryfilter", { options: options });
    		$(target).removeClass('body_ass').addClass("body_ass");

            //添加自定义分组属性
            if (options.scope) {
                $(target).attr('scope', options.scope);
                if ($('#' + options.scope).length>0) {

                } else {
                    var node = $('<div id="' + options.scope + '" class="page_ass clearfix"><div class="filter_crumb fllef clearfix"><span><a href="javascript:;">全部结果</a></span><span><i class="fa fa-angle-right" aria-hidden="true"></i></span><span class="c_resl">"手机"</span></div></div>');
                    $('div[scope="' + options.scope + '"]:eq(0)').before(node);
                }
            }
            
            //接收url传参后 容器中添加选择项
            if($this.UrlValue('eval') != null){ 
                var pValue = $this.postUrl(options);
                $.each(pValue,function(i,objData){
                    $this.addSelected($('#' + options.scope), objData, target);//容器中添加选择项
                });
            }

    		$.each(options.data,function(key,value){
                if(value.display){
                    countArr.push(value);
        			var listcontainer = $('<div class="ass_category"></div>')
                    var dl = $('<dl class="ass_wrap clerafix"></dl>');
    				$('.'+value.name).removeClass('hotel-filter-list filter-list-has-more hotel-filter-list-min').addClass("hotel-filter-list filter-list-has-more hotel-filter-list-min");
    				
                    //dt.ass_key标题
                    var dtNode = $('<dt class="ass_key"></dt>');
                    if(value.tbold=="bold"){
                        dtNode.append($('<b>'+ value.title + '</b>'));
                    }else{
                        dtNode.append($('<span>'+ value.title + '</span>'));
                    }
                    dl.append(dtNode);

                    //dd.ass_value列表
                    var dNodeVal = $('<dd class="ass_value '+value.name+' clearfix"></dd>');
                    dl.append(dNodeVal);
                    
                    //dd.ass_ext按钮
                    var dNodeExt = $('<dd class="ass_ext"></dd>');
                    dl.append(dNodeExt);

                    listcontainer.append(dl);
    				$(target).append(listcontainer);
    				$.fn.categoryfilter.methods["load"](target,value); 
               }
			});

            //底部添加【更多选项】，超过3个选项(countArr.length>3)时显示
            var csmore = $('<div class="ass_extr clearfix"></div>');
            var cysa   = $('<a href="javascript:;" class="a_extr_more"><span class="a_e_sp">更多选项</span><i class="fa fa-angle-down" aria-hidden="true"></i></a>')
            cysa.on('click',function(e){
                if($(this).find('.a_e_sp').text()=='更多选项'){
                    $(this).find('.a_e_sp').text('收起选项');
                    $(this).find('i.fa').addClass('fa-angle-up').removeClass('fa-angle-down');
                    $(target).find('.ass_category').eq(3).show().nextAll('.ass_category').show();
                }else{
                    $(this).find('.a_e_sp').text('更多选项');
                    $(this).find('i.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
                    $(target).find('.ass_category').eq(3).hide().nextAll('.ass_category').hide();
                }
            });
            csmore.append(cysa);
            if(countArr.length>3){
                $(target).find('.ass_category').eq(3).hide().nextAll('.ass_category').hide();
                $(target).append(csmore);
            }
		},
		load: function (target, opts) {  //向基础框架添加数据
			var $this   = this;
			var options = $.extend({}, $.fn.categoryfilter.methods["options"](target), opts);
			if (opts.url) {
    			console.log(opts.title)
				$.ajax({
					type: 'post',
					data: options.param,
					url: options.url,
					success: function(data) {
						if (typeof (data) == typeof ("string")) {
							data = $.parseJSON(data);
						}
						var listTarget = $(target).find('.list').html('');
						$this.setData(listTarget, options, data, target);
					},
					error: function(e) {
						$this.onError(e);
					}
				});
			} else {
				var tag='.'+opts.name;
				var listTarget = $(target).find(tag).html('');
                if(options.logo){
                    $this.setLogoData(listTarget, options, options.data, target);
                }else{
                    $this.setData(listTarget, options, options.data, target);
                }
			}
		},
        moreBtnShow: function (target) {  // 【更多】按钮的显示和隐藏判断
            var ulWp    = $(target).find(".ass_valueList"),
                liWp    = ulWp.find("li"),
                moreBtn = $(target).siblings('.ass_ext').find(".ass_e_more"),
                ulH     = ulWp.height()
                liH     = liWp.last().offset().top - ulWp.offset().top+liWp.outerHeight(true);
            console.log()
            if (ulH < liH) {
                moreBtn.css("visibility", "visible");
            }else{
                moreBtn.css("visibility", "hidden");
            }
        },
        selectedShow: function (target) {  // 多选状态下【已选条件】和【确定】按钮的显示和隐藏判断
            var liSel  = target.find(".ass_valueList"),
                selShw = target.find('.sel_v_selected'),
                selBtn = target.find(".sel_v_btns");
            if($(liSel).find("li.selected").length > 0){
                $(selShw).show();
                $(selBtn).children(".btn_primary").removeClass("disabled").attr("disabled",false);
            }else{
                $(selShw).hide();
                $(selBtn).children(".btn_primary").addClass("disabled").attr("disabled",true);
            };
        },
        addSelectedLi: function (target,sag,itemData, options) {  // 多选状态下【已选条件】列表增加li
            var $this  = this;
            var u      = target.find('.sel_v_selected .sel_v_list'),
                lis    = $('<li class="selected" data-value="'+options.name+'"></li>'),
                as     =$('<a href="javascript:;" title="'+itemData.name+'"><i class="fa fa-check-square-o" aria-hidden="true"></i><span>'+itemData.value+'</span></a>');
            as.unbind('click').bind('click', function (e) {
                $(sag).trigger("click.selected-sag");//触发事件
                $this.selectedShow(target);
            });
            $(sag).unbind('click.selected-sag').bind('click.selected-sag', function (e) {
                $(sag).removeClass('selected');
                $(lis).remove();
                $(sag).unbind('click.selected-sag');
                $this.selectedShow(target);
            });

            lis.append(as);
            u.append(lis);
            $this.selectedShow(target);
        },
        setLogoData: function (target, options, data, targetContain) {  //添加数据 并 绑定事件
            var $this  = this;
            var logos  = $('<div class="sel_v_logos"></div>');
            var ulLogo = $('<ul class="ass_valueList ass_v_fixed clearfix"></ul>');
            var ulLet  = $('<ul class="sel_letter clearfix" style="display: none;"></ul>');
            ulLet.append($('<li class="curr" data-numb="all">'+ '所有品牌' +'</li>'));
            var ulArr  = [];

            $.each(data, function (i, item) {
                var listnode = $('<li data-numb="'+ item['data-numb'] +'"></li>');
                var clicka = $('<a href="javascript:;" data-id="' + item['id'] + '" data-value="' + item['value'] + '" data-text="' + item['value'] + '">' + '<img src="'+ item['src'] +'" alt=""><i class="fa fa-square-o" aria-hidden="true"></i>' + item['value'] + '</a>').data('data', item['value']);
                ulArr.push(item['data-numb']);
                listnode.unbind('click').bind('click', function (e) {
                    if (listnode.hasClass('selected')) {//验证是否被选择，已经选择则取消选择，反之选择
                        listnode.removeClass('selected');//不可去掉（为了计算Value的正确性）
                    } else {
                        listnode.addClass('selected');
                        if(targetContain.find('.ass_wrap').hasClass('multiple')){
                            $this.addSelectedLi(target, listnode, item, options);
                        }else{
                            options.newClick(target,options); //执行点击事件
                        }
                    }                    
                });
                listnode.append(clicka);
                ulLogo.append(listnode);
                logos.append(ulLogo);
                target.append(logos);
            });

            $.unique(ulArr.sort());
            $.each(ulArr, function (i, arr) { //品牌分类li列表
                var letLi  = $('<li data-numb="'+ arr +'">'+ arr +'</li>');
                letLi.on('mouseover',function(){
                    letLi.addClass('curr').siblings('li').removeClass('curr');
                    $.each(target.find('.sel_v_logos li'), function (a, b) {
                        if($(b).attr('data-numb') == arr){
                            $(b).css('display','block');
                        }else{
                            $(b).hide();
                        }
                    });
                });
                ulLet.append(letLi);
            });
            ulLet.on('mouseover','li',function(){
                $(this).addClass('curr').siblings('li').removeClass('curr');
                if ($(this).attr('data-numb') == 'all') {
                    console.log($(this).html());
                    $(target).find('.sel_v_logos li').css('display','block');
                };
            });

            $this.assBtnLoad(target, options, data, targetContain);
            target.find('.sel_v_logos').eq(0).before(ulLet);
            ulLet.after($('<div class="cls"></div>'));
            $this.setSeled(target, options, data, targetContain);
            $this.setBtnMul(target, options);
            $this.moreBtnShow(target);
            options.onLoadSuccess(data);//触发加载完成事件
        },
		setData: function (target, options, data, targetContain) {  //添加数据 并 绑定事件
			var $this = this;
            var selWp  = $('<div class="sel_v_list"></div>');
            var ulWp = $('<ul class="ass_valueList"></ul>');
            
			$.each(data, function (i, item) {
				var listnode = $(' <li></li>');
				var clicka = $('<a href="javascript:;" data-id="' + item['id'] + '" data-value="' + item['value'] + '"><i class="fa fa-square-o" aria-hidden="true"></i>' + item['value'] + '</a>').data('data', item['value']);
				listnode.unbind('click').bind('click', function (e) {
                    if (listnode.hasClass('selected')) {//验证是否被选择，已经选择则取消选择，反之选择
                        listnode.removeClass('selected');//不可去掉（为了计算Value的正确性）
                        $this.selectedShow(target);
                        $this.iSelected(listnode);
                    } else {
                        listnode.addClass('selected');
                        $this.iSelected(listnode);
                        if(targetContain.find('.ass_wrap').hasClass('multiple')){
                            $this.selectedShow(target);
                        }else{
                            options.newClick(target,options); //执行点击事件
                        }
                    }
                });
				listnode.append(clicka);
				ulWp.append(listnode);
			});
            $this.assBtnLoad(target, options, data, targetContain);
            selWp.append(ulWp);
            target.append(selWp);
            $this.setBtnMul(target, options);
            $this.moreBtnShow(target);
            options.onLoadSuccess(data);//触发加载完成事件
        },
        setSeled: function (target, options, data, targetContain) {  //添加【已选条件】框架
            var sed    = $('<div class="sel_v_selected"><span class="sel_v_txt">已选条件：</span></div>');
            var ulSed  = $('<ul class="sel_v_list"></ul>');

            sed.append(ulSed);
            target.append(sed);
        },
        iSelected: function (target) {  //点击li，i的变化事件
            var i    = $(target).find('i');
            if(target.hasClass('selected')){
                i.addClass("fa-check-square-o").removeClass("fa-square-o");
            }else{
                i.removeClass("fa-check-square-o").addClass("fa-square-o");
            }
        },
        moreBtnClick: function (a){  //【更多】按钮事件
            if(a.hasClass("opened")){
                a.removeClass("opened").parents(".ass_wrap").removeClass("extend");;
                a.find("span").html("更多");
                a.find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            }else{
                a.addClass("opened").parents(".ass_wrap").addClass("extend");
                a.find("span").html("收起");
                a.find("i").addClass("fa-angle-up").removeClass("fa-angle-down");
            }
        },
        delBtnClick: function (b){ //【取消】按钮事件
            var $this  = this;
            $(b).siblings('.ass_ext').show().parents(".ass_wrap").removeClass("multiple");
            $(b).find('.sel_letter').find("li[data-numb='all']").addClass('curr').siblings('li').removeClass('curr');
            $(b).find('.sel_v_logos li').show().removeClass('selected');
            $(b).find('.sel_letter').hide();
            $(b).find('.sel_v_selected .sel_v_list li.selected').remove();
            $(b).find('.sel_v_list li.selected').removeClass('selected');
            $this.selectedShow(b);
            $this.iSelected($(b).find('.sel_v_list li'));
        },
        setBtnMul: function (target, options) {  //【确定】【取消】按钮
            var $this  = this,
                selBtn = $('<div class="sel_v_btns"></div>'),
                a1     = $('<a href="javascript:;" class="btn btn_primary disabled" disabled>确定</a>'),
                a2     = $('<a href="javascript:;" class="btn btn_default">取消</a>');
            a1.on('click',function(e){ //【确定】按钮
                e.stopPropagation();
                if (a1.attr("disabled") == "disabled") return
                options.newClick(target,options); //执行点击事件
            });
            a2.on('click',function(e){ //【取消】按钮
                $this.delBtnClick(target);
            });
            selBtn.append(a1);
            selBtn.append(a2);
            target.append(selBtn);
        },
        assBtnLoad: function (target, options, data, targetContain) {  //ext按钮加载 + 按钮事件
            var $this  = this;
            var a1 = $('<a href="javascript:;" class="ass_e_more"><span>更多</span><i class="fa fa-angle-down" aria-hidden="true"></i></a>');
            var a2 = $('<a href="javascript:;" class="ass_e_multiple"><i class="fa fa-plus-square-o" aria-hidden="true"></i><span>多选</span></a>');
            a1.on('click',function(e){ //【更多】按钮
                $this.moreBtnClick(a1);
                var sibA1 = a1.parents('.ass_category').siblings('.ass_category').find('.ass_e_more.opened');
                var sibA2 = a2.parents('.ass_category').siblings('.ass_category').find('.multiple .ass_value');
                $this.moreBtnClick(sibA1);
                $this.delBtnClick(sibA2);
            });
            a2.on('click',function(e){ //【多选】按钮
                var sibA1 = $(targetContain).find('.ass_category .ass_e_more.opened');
                var sibA2 = a2.parents('.ass_category').siblings('.ass_category').find('.multiple .ass_value');
                a2.parent().hide().parents(".ass_wrap").addClass("multiple");
                $this.moreBtnClick(sibA1);
                $this.delBtnClick(sibA2);
                $(target).find('.sel_letter').show();
            });

            var ext = $(target).siblings('.ass_ext');
            ext.append(a1).append(a2);
        },
        //添加已经选择项
        //pointTarget：选择项容器
        //itemData 被选择数据
        //targetContain 大容器,
        addSelected: function (pointTarget, itemData, targetContain) {
        	var $this = this;
            var sp    = $('<span><i class="fa fa-angle-right" aria-hidden="true"></i></span>');
        	var anode = $('<a data-category="'+itemData.id+'" name="'+itemData.name+'" title="'+itemData.value+'" href="javascript:;" class="crumb_sel_item"><span class="c_tl">'+itemData.title+'：'+'</span><span>' + itemData.value.substring(0,20)
 + '</span></a>');
            anode.unbind('click').bind('click', function (e) {
                var that = this;
                $this.delSelected(that,targetContain); //删除选择的项
            });
            //创建X ,点击则移除选择项
            var inode = $('<i class="fa fa-trash-o" aria-hidden="true"></i>');
            anode.append(inode);
            pointTarget.find('.filter_crumb').children().last().before(anode).before(sp);
        },
        //点击删除选择的项
        delSelected: function (that,target) { 
            var $this = this;
            var hrefUrl = window.location.href;
            var searUrl = $this.UrlValue('eval');
            var c = $(that).attr('name') +'_'+ $(that).attr('data-category').split(',').join('|');
            var d = searUrl.split('^');
            if($this.UrlValue('eval') != null && searUrl.indexOf(c)>-1){
                var bsUrl = hrefUrl.match(/(\S*)eval=/)[1];
                d.forEach(function(val,key){
                    if (val == c) d.splice(key,1);
                });
                var url;
                if(d.length>0){
                    url = bsUrl + 'eval='+d.join('^');
                }else{
                    if(bsUrl.substring(bsUrl.indexOf('?')+1) <= 0) bsUrl = bsUrl.replace('?','');
                    url = bsUrl;
                }
                window.location.href = url;
            }
        }
    };

    $.fn.categoryfilter.parseOptions = function (target) {
    	return $.extend({}, $.fn.datagrid.parseOptions(target), {});
    };

    $.fn.categoryfilter.defaults = {
        url: '', 
        data:[],
        idField: 'id',
        scope: 'Category',
        text: '',
        param: {},
        newClick: function (target,options) { },
        newChange: function (newValue) { },
        onLoadSuccess: function (data) { },
        onError: function (e) { }
    };

})(jQuery);

/*列表页条件筛选 end*/
