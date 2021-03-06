window.WXAPP = window.WXAPP || {};

//ajax
(function () {
    var Ajax = function (url, data, success) {
        $.ajax({
            url: url,
            data: data || {},
            type: "POST",
            dataType: 'json',
            success: function (res) {
                if (res.code === 200) {
                    success.call(this, res);
                }else if(res.code===500){
                    alert(res.data);
                }
            },
            error: function () {
                alert('网络出错，请重试');
            }
        });
    }
    WXAPP.Ajax = Ajax;
})();

//Entity
(function () {
    function Entity(type, form, table, newBtn, options) {
        this.type = type;
        this.form = form;
        this.table = table;
        this.newBtn = newBtn;
        this.options = {};
        options = options || {};
        for (var op in options) {
            this.options[op] = options[op];
        }
        this.bindEvent();
        this.mode = 'insert'; // or update

    }
    Entity.prototype.changeId = function () {
        var self = this;
        if (!self.options.multiple) {
            self.newBtn.hide();
        }
        self.form.hide();
        var id = this.newBtn.parent().find('.J_estate_list').val();
        self.setEstateId(id);
        self.fetchList();
    }

    Entity.prototype.bindEvent = function () {
        var self = this;
        this.newBtn.click(function () {
            var selectedEstate = $(this).parent().find('.J_estate_list').val();
            if (selectedEstate == WXAPP.EMPTY_ESTATE) {
                alert('请选择楼盘');
                return;
            }
            self.mode = 'insert';
            self.setEstateId(selectedEstate);
            self.empty();
            self.form.show();
        });
        this.newBtn.parent().find('.J_estate_list').change(function(){
            self.changeId();
        });
        this.form.find('.J_submit').click(function () {
            self[self.mode]();
        });
        this.form.find('.J_cancel').click(function () {
            self.form.hide();
        });

        this.table.delegate('.J_view','click',function(e){
            var t = $(e.currentTarget);
            $('<div class="box-layer" style="width:700px;position:absolute;top:'+($(window).scrollTop()+70)+'px;">' +
                '<div class="title"><h2>户型数据</h2></div>' +
                '<a class="close J_cancel" href="javascript:;" title="关闭">关闭</a>' +
                '<div style="padding:30px;">'+
                '<p>url:</p>'+
                '<p>'+location.hostname+ t.attr('data-url')+'</p>'+
                '</div></div>').appendTo(document.body).find('.J_cancel').click(function(){
                    $(this).parent().remove();
                });

        });

    }
    Entity.prototype.insert = function (callback) {
        var self = this;
        if (!this.check()) {
            return;
        }
        WXAPP.Ajax('?r=entity/ajaxinsert', {
            estate_id: this.estate_id,
            type: this.type,
            content: JSON.stringify(this.getData())
        }, callback || function () {
            alert('创建成功');
            self.changeId();
        });
    }
    Entity.prototype.update = function (callback) {
        var self = this;
        if (!this.check()) {
            return;
        }
        WXAPP.Ajax('?r=entity/ajaxupdate', {
            id: this.id,
            content: JSON.stringify(this.getData())
        }, callback || function () {
            alert('修改成功');
            self.changeId();
        });
    }
    Entity.prototype.check = function () {
        return true;
    }
    Entity.prototype.getData = function () {
        var data = {};
        this.form.find('.J_modules').each(function (i, module) {
            var moduleName = $(module).attr('data-module');
            data[moduleName] = [];
            $(module).find('.J_module_item').each(function (j, item) {
                var itemData = {};
                $(item).find('.J_field').each(function (k, field) {
                    itemData[$(field).attr('name')] = $(field).val();
                });
                data[moduleName].push(itemData);
            });
        });
        this.form.find(".J_module").each(function (i, module) {
            var moduleName = $(module).attr('data-module');
            data[moduleName] = {};
            $(module).find('.J_field').each(function (j, field) {
                data[moduleName][$(field).attr('name')] = $(field).val();
            });
        });
        return data;
    }
    Entity.prototype.setData = function (data) {
        var content;
        var self = this;
        if (!data) {
            return;
        }
        if (data.estate_id) {
            this.estate_id = data.estate_id;
        }
        if (data.content) {
            content = JSON.parse(data.content);
        }
        if (content) {
            this.form.find('.J_modules').each(function (i, module) {
                var moduleName = $(module).attr('data-module');
                var moduleData = content[moduleName];
                $(module).find('.J_module_item').each(function (j, item) {
                    var itemData = moduleData[j];
                    if (itemData) {
                        $(item).find('.J_field').each(function (k, field) {
                            $(field).val(itemData[$(field).attr('name')]);

                        });
                    }
                });
            });
            this.form.find('.J_module').each(function (i, module) {
                var moduleName = $(module).attr('data-module');
                var moduleData = content[moduleName];
                if (moduleData) {
                    $(module).find('.J_field').each(function (j, field) {
                        var value = moduleData[$(field).attr('name')];
                        $(field).val(value);
                        if ($(field).get(0).nodeName.toLowerCase() === "img" && value) {
                            $(field).attr('src', 'upload_files/' + self.estate_id + "/" + value);
                        }
                    });
                }
            });
        }
    }
    Entity.prototype.setEstateId = function (id) {
        this.estate_id = id;
        try {
            window.setEstateId(id);
        } catch (e) {
        }
    }
    Entity.prototype.setId = function (id) {
        this.id = id;
    }
    Entity.prototype.fetchList = function () {
        var self = this;
        WXAPP.Ajax('?r=entity/ajaxgetentitiesbyestateid', {
            estate_id: this.estate_id,
            type: this.type
        }, function (res) {
            self.renderList(res);
        });
    }
    Entity.prototype.renderList = function (res) {
        var self = this;
        self.table.empty();
        if (!res.data.length) {
            self.newBtn.show();
            alert('该楼盘还没有数据');
        }
        res.data.forEach(function (item) {
//            if (item.status == '0') {
//                hasUnChecked = true;
//            }
            self.table.append(self.tableTemplate.call(self, item));
        });
//        if (!hasUnChecked) {
//            self.newBtn.show();
//        }
        self.table.find('.J_edit').click(function () {
            self.mode = 'update';
            var id = $(this).attr('data-id');
            self.setId(id);
            WXAPP.Ajax('?r=entity/ajaxgetentitybyid', {
                id: id
            }, function (res) {
                self.form.show();
                self.setData(res.data);
            });
        });
    }
    Entity.prototype.getStatus = function (code) {
        var status = {
            0: '未审核',
            1: '已审核',
            2: '驳回',
            3: '已过期'
        }
        return status[code];

    }
    Entity.prototype.empty = function () {
        this.form.find('input').val('');
        this.form.find('textarea').val('');
    }
    Entity.prototype.tableTemplate = function (item) {
        return '<tr><td>' + item.estate_id + '</td>' +
            '<td>' + item.estate_name + '</td>' +
            '<td>' + item.create_time + '</td>' +
            '<td>' + this.getStatus(item.status) + '</td>' +
            '<td><a class="blue J_edit" href="javascript:;" data-id="' + item.id + '">编辑</a> ' +
            '<a href="/weapp/php/cgi/preview.php?eid='+item.estate_id+'&t='+item.type+'&gid='+item.group_id+'" target="_blank">预览</a>' +
            (item.status==1?' <a class="J_view" href="javascript:;" data-url="/weapp/php/cgi/jump.php?eid='+item.estate_id+'&t='+item.type+'&appid='+item.appid+'&gid='+item.group_id+'" target="_blank">查看</a>':'')+
            '</td></tr>';
    }

    WXAPP.Entity = Entity;
    WXAPP.EMPTY_ESTATE = -1;
})();

//Entity Init
(function () {
    //Entity 页面初始化
    var form = $('#J_entity_form'),
        newBtn = $('#J_entity_new'),
        table = $('#J_entity_table tbody');
    if (!form.length) {
        return;
    }
    var entity = new WXAPP.Entity(form.attr('data-type'), form, table, newBtn, {
        multiple: form.attr('data-multiple') === "true"
    });
    if (entity.type == "reservation") {
        entity.tableTemplate = function (item) {
            var content = JSON.parse(item.content);
            return '<tr><td>' + item.id + '</td><td>' + content.event.name + '</td><td>' + item.estate_name + '</td><td>' + content.event.start_date + '-' + content.event.end_date + '</td><td>' + item.create_time + '</td><td>' + this.getStatus(item.status) + '</td><td><a class="blue J_edit" href="javascript:;" data-id="' + item.id + '">编辑</a>' +
                '<a href="/weapp/php/cgi/preview.php?eid='+item.estate_id+'&t='+ item.type +'&gid='+item.group_id+'" target="_blank">预览</a>' +
            (item.status==1?' <a class="J_view" href="javascript:;" data-url="/weapp/php/cgi/jump.php?eid='+item.estate_id+'&t='+item.type+'&appid='+item.appid+'&gid='+item.group_id+'" target="_blank">查看</a>':'')+
                '</td></tr>';
        }
    }
    if(entity.type==="impression"){
        //印象, 校验加起来不能超过100
        entity.check = function(){
            var sum = 0;
            form.find('.J_field[name=percent]').each(function(){
                var value = $(this).val();
                sum+= value?parseInt(value):0;
            });
            if(sum>100){
                alert('印象总和不能超过100%');
                return false;
            }
            return true;
        }

    }
})();

//日历，图片上传
(function () {
    //日历
    $('.ico-calendar').prev().datepicker({
        dateFormat: 'yy-mm-dd'
    });

    //图片上传
    WXAPP.bindLoad = function (btns) {
        btns.each(function (i, button) {
            var id = 'J_upload' + (+new Date());
            $(button).attr('id', id);
            var infoSpan = $(button).parent().parent().find('.J_display');
            var swfu = new SWFUpload({
                upload_url: "upload_file.php",
                flash_url: "js/upload/flash/swfupload.swf",
                flash9_url: "http://www.swfupload.org/swfupload_fp9.swf",
                file_size_limit: "100 KB", //文件大小限制
                button_placeholder_id: id,
                button_width: 83,
                button_height: 31,
                button_image_url: 'img/upload.png',
                file_post_name: 'file',
                file_dialog_complete_handler: function () {
                    this.addPostParam('estate_id', window.getEstateId());
                    this.startUpload();

                    infoSpan.find('.info').html('正在上传..');
                },
                upload_progress_handler: function () {
                    //console.log(arguments);
                },
                upload_success_handler: function (file, res) {
                    res = JSON.parse(res);
                    if (res.code == 200) {
                        infoSpan.find('.info').html('上传成功!');
                        infoSpan.find('img').val(res.data.id).attr('src', res.data.src);
                    } else {
                        alert(res.data.msg);
                    }
                }
            });
        });
    }

    WXAPP.bindLoad($('.J_upload'))

    var estate_id;
    window.setEstateId = function (id) {
        estate_id = id;
    }
    window.getEstateId = function () {
        return estate_id;
    }
})();


//楼盘
(function () {
    //楼盘Class
    function Estate(form) {
        this.form = form;
    }

    Estate.prototype.save = function (id) {
        if (this.check()) {
            var data = this.getData();
            if (this.id) {
                data.id = this.id;
            }
            WXAPP.Ajax('?r=estate/ajaxsave', data, function () {
                alert('保存成功');
                location.reload();
            });
        }
    }
    Estate.prototype.check = function () {
        var data = this.getData();
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (!data[key]) {
                    alert('请填写' + key);
                    return false;
                }
            }
        }
        return true;
    }
    Estate.prototype.getData = function () {
        var data = {};
        this.form.find('.J_field').each(function (i, item) {
            data[$(item).attr('name')] = $(item).val();
        })
        return data;
    }
    Estate.prototype.setData = function (data) {
        this.form.find('.J_field').each(function (i, item) {
            $(item).val(data[$(item).attr('name')] || '');
        });
    }
    Estate.prototype.empty = function () {
        this.form.find('.J_field').each(function (i, item) {
            $(item).val('');
        })
    }
    Estate.prototype.setId = function (id) {
        this.id = id;
    }

    WXAPP.Estate = Estate;
})();
(function () {
    //楼盘管理
    var table = $('#J_estate_table');
    if (!table.length) {
        return;
    }

    var estate = new WXAPP.Estate($('.J_estate_form'));

    //编辑
    table.find('.J_edit').click(function () {
        var id = $(this).attr('data-id')
        WXAPP.Ajax('?r=estate/ajaxgetestatebyid', {
            id: id
        }, function (res) {
            estate.form.show();
            estate.setData(res.data);
            estate.setId(id);
        });
    });
    //删除
    table.find('.J_delete').click(function () {
        if (confirm('确定要删除该楼盘吗？删除后无法恢复！')) {
            WXAPP.Ajax('?r=estate/ajaxdelete', {
                id: $(this).attr('data-id')
            }, function (res) {
                alert('删除成功!');
                location.reload();
            });
        }
    });
    //新增
    table.find('.J_new_estate').click(function () {
        estate.empty();
        estate.setId(null);
        estate.form.show();
    });
    //保存
    estate.form.find('.J_save').click(function () {
        estate.save();
    });
    //取消
    estate.form.find('.J_cancel').click(function () {
        estate.form.hide();
    });
})();

//审批
(function () {
    AuditAdmin = {
        listAllPassedData: function () {
            WXAPP.Ajax('?r=audit/ajaxgetauditpasseddata', {

            }, function (res) {
                var table = $('#J_audit_list_all_passed_data_table tbody');
                var map = {
                    1: '审核通过',
                    2:'审核驳回',
                    'intro': '楼盘',
                    'apartment': '户型',
                    'group': '看房团',
                    'picture': '照片墙',
                    'reservation': '认筹',
                    'comment': '专家建议',
                    'impression': '用户印象',
                    'advertise':'多业态'

                }
                table.empty();
                res.data.forEach(function (item) {
                    table.append('<tr><td>' + item.estate_id + '</td>' +
                        '<td>' + item.name + '</td><td>'
                        + map[item.entity_type] + '</td><td>'
                        + item.create_time + '</td><td>'
                        + map[item.entity_status]
                        + '</td>'
                        + '</tr>')
                });

                table.find('.J_detail').click(function () {
                    var id = $(this).attr('entity-id');
                    //location.href='?r=estate/info&id='+id;
                });
            });
        }
    }

    WXAPP.AuditAdmin = AuditAdmin;
})();

(function () {
    function successCallBack(res) {
        var table = $('#J_audit_table tbody');
        var map = {
            0: '待审核',
            'intro': '楼盘简介',
            'apartment': '户型',
            'group': '看房团',
            'picture': '照片墙',
            'reservation': '认筹',
            'comment': '专家建议',
            'impression': '用户印象',
            'advertise':'多业态'
        }
        table.empty();
        res.data.forEach(function (item) {
            var t=item.entity_type;
            if(t=='comment'){

                t='impression';
            }
            table.append('<tr><td>' + item.estate_id + '</td>' +
                '<td>' + item.name + '</td><td>'
                + map[item.entity_type] + '</td><td>'
                + item.create_time + '</td><td>'
                + item.username + '</td><td>'
                + map[item.entity_status]
                + '</td><td><a class="blue J_detail" href="/weapp/php/cgi/preview.php?eid='
                + item.estate_id+'&t='+t+'" target="_blank" '
                + 'data-id="' + item.id
                + '" entity-id="' + item.entity_id + '">详情</a>'
                + '<a class="blue J_pass" href="javascript:;" data-id="' + item.id
                + '" entity-id="' + item.entity_id
                + '" estate-id="' + item.estate_id
                + '" entity-type="' + item.entity_type + '">通过</a>'
                + '<a class="blue J_fail" href="javascript:;" data-id="' + item.id
                + '" entity-id="' + item.entity_id + '">驳回</a>'
                + '</td></tr>')
        });

        table.find('.J_details').click(function () {

        });

        table.find('.J_pass').click(function () {
            var id = $(this).attr('data-id');
            var entity_id = $(this).attr('entity-id');
            var estate_id = $(this).attr('estate-id');
            var entity_type = $(this).attr('entity-type');
            WXAPP.Ajax('?r=audit/ajaxupdateauditbyid', {
                id: id, status: 1, entity_id: entity_id, estate_id: estate_id, entity_type: entity_type
            }, function (res) {
                if (res.code == 200) {
                    location.reload();
                    alert('审核成功！');
                }
            });
        });

        table.find('.J_fail').click(function () {
            var id = $(this).attr('data-id');
            var entity_id = $(this).attr('entity-id');
            WXAPP.Ajax('?r=audit/ajaxupdateauditbyid', {
                id: id, status: 2, entity_id: entity_id
            }, function (res) {
                if (res.code == 200) {
                    location.reload();
                    alert('已驳回！');
                }
            });
        });
    }

    var Audit = {
        setAllAuditData:function(){
            WXAPP.Ajax('?r=audit/ajaxgetauditdata', {
            }, successCallBack);
        }
    }
    WXAPP.Audit = Audit;

    $('#J_audit').find('.J_estate_list').change(function () {
        var id = $(this).val();
        WXAPP.Ajax('?r=audit/ajaxgetauditdatabyestateid', {
            estate_id: id,
            entity_type: 'group'
        }, successCallBack);
    });
})();

//照片墙设置
(function () {
    var descLayer = $('#J_desc_layer');
    var layerbg = $("#J_layer_bg")
    descLayer.find('.J_save').click(function () {
        descTarget.val(descLayer.find('.J_text').val());
        descLayer.hide();
        layerbg.hide();
    })
    descLayer.find('.J_cancel').click(function () {
        descLayer.hide();
        layerbg.hide();
    });
    var descTarget = null;
    $(document).on('click','.J_pic_desc_btn',function () {
        var desc = $(this).next().val();
        descTarget = $(this).next();
        descLayer.find('.J_text').val(desc);
        descLayer.show();
        layerbg.show();
    });

    var titleLayer = $('#J_title_layer');
    titleLayer.find('.J_save').click(function () {
        titleTarget.val(titleLayer.find('.J_title').val());
        subtitleTarget.val(titleLayer.find('.J_subtitle').val());
        titleLayer.hide();
        layerbg.hide();
    })
    titleLayer.find('.J_cancel').click(function () {
        titleLayer.hide();
        layerbg.hide();
    });
    var titleTarget;
    var subtitleTarget;
    $(document).on('click','.J_pic_title_btn',function () {
        var title = $(this).next().val();
        var subtitle = $(this).next().next().val();
        titleTarget = $(this).next();
        subtitleTarget = $(this).next().next();
        titleLayer.find('.J_title').val(title);
        titleLayer.find('.J_subtitle').val(subtitle);
        titleLayer.show();
        layerbg.show();
    });

})();


(function(){

    function postListSuccessCallback(res) {
        var postBody = $('#topic_id');
        res.data.forEach(function (item) {
            postBody.append('<div class="mod-box" onclick="WXAPP.Post.showDetail(&#39;'+item.id+'&#39;)">'
                +'<h3 class="mod-box__title ui-mb-small">'
                +item.title+'</h3>'
                +'<div class="mod-box__time">'
                +'<span class="ui-fl-l ui-c-light">'+item.wechat_id+' '+item.create_time+'</span>'
                +'<span class="ui-c-light"><span class="icon-eye"></span>浏览('+item.pv_num+')</span></div>'
                +'<div class="mod-box__content ui-mb-medium">'
                +item.content+'</div>'
                +'<div class="mod-box__control">'
//                +'<i class="icon-heart"></i></span>赞('+item.praise_num+')</span>'
                +'<i class="icon-comment"></i><span>评论('+item.comment_num+')</span>'
                +'</div>'
                +'</div>')
        });
    }
    function postDetailSuccessCallback(res) {
        var postBody = $('#topic_id');
            postBody.append('<div class="mod-box" onclick="WXAPP.Post.showDetail(&#39;'+res.data[0].id+'&#39;)">'
                +'<h3 class="mod-box__title ui-mb-small">'
                +res.data[0].title+'</h3>'
                +'<div class="mod-box__time">'
                +'<span class="ui-fl-l ui-c-light">'+res.data[0].wechat_id+' '+res.data[0].create_time+'</span>'
                +'<span class="ui-c-light"><span class="icon-eye"></span>浏览('+res.data[0].pv_num+')</span></div>'
                +'<div class="mod-box__content ui-mb-medium">'
                +res.data[0].content+'</div>'
                +'<div class="mod-box__control">'
//                +'<i class="icon-heart"></i></span>赞('+res.data[0].praise_num+')</span>'
                +'<i class="icon-comment"></i><span>评论('+res.comment.length+')</span>'
                +'</div>'
                +'</div>')

        var commentBody=$('#commentList');
        if(res.comment.length>0){
            res.comment.forEach(function(item){
                commentBody.append('<div class="mod-box">'
                    +'<div class="mod-box__time">'
                    +'<span class="ui-fl-l ui-c-light">'+item.wechat_id+' '+item.create_time+'</span><br>'
                    +'<div class="mod-box__content ui-mb-medium" style="text-align: left">'
                    +item.content+'</div>'
                    +'</div>'
                    +'</div>')
            });

        }

    }
    var Post={
        getListData:function(eid){
            WXAPP.Ajax('?r=post/ajaxgetpostlist', {
                eid:eid,page_num:1
            }, postListSuccessCallback);
        },

        getDetailData:function(id){
            WXAPP.Ajax('?r=post/ajaxgetpostdetail', {
                id:id
            }, postDetailSuccessCallback);
        },

        showDetail:function(id){
            var eid=$('#current_estate_id').val();
            var appid=$('#app_id').val();
            var openid=$('#open_id').val();
            var nickname=$('#nick_name').val();

            location.href='?r=post/detail&id='+id+'&eid='+eid+'&appid='+appid+'&openid='+openid+'&nickname='+nickname;
        },
        getMoreData:function(){
            var eid=$('#current_estate_id').val();
            var page_num=parseInt($('#current_page_num').val())+1;
            WXAPP.Ajax('?r=post/ajaxgetpostlist', {
                eid:eid,page_num:page_num
            }, postListSuccessCallback);

            $('#current_page_num')[0].value=page_num.toString();
        }

    };
    WXAPP.Post = Post;
})();


//户型管理
(function () {
    var form = $('#J_apartment_form'),
        newBtn = $('#J_entity_new'),
        table = $('#J_entity_table tbody');
    if (!form.length) {
        return;
    }
    var entity = new WXAPP.Entity(form.attr('data-type'), form, table, newBtn, {
        multiple: form.attr('data-multiple') === "true"
    });

    form.find('.J_add').click(function(){
        addAType();
    });

    var holder = $('.J_holder');

    var html = '<div class="J_loop">' +
        '<h3>户型分类：<input class="J_type_name" name="type_name" ></h3>' +
        '<ul class="J_type_list"></ul></div>';
    var typeList1 = '<li>户型名：<span class="J_name"></span><input type="hidden"><button class="btn-cha J_edit" type="button">编辑</button></li>';

    entity.getData = function () {
        var res = {
            "top_img":"",
            types:[]
        };
        var data = res.types;
        holder.find('.J_loop').each(function (i, loop) {
            var typeData = {};
            typeData.type_name = $(loop).find('.J_type_name').val();
            typeData.type_list = [];
            $(loop).find('.J_type_list input[type=hidden]').each(function (i, item) {
                typeData.type_list.push(JSON.parse($(item).val()));
            });
            data.push(typeData);
        });
        res.top_img = $('.J_field[name=top_img]').val();
        return res;
    }
    function edit(data, type, cb) {
        var layer = $('<div class="box-layer" style="width:700px;">' +
            ' <div class="title"><h2>户型数据</h2></div>' +
            '<a class="close J_cancel" href="javascript:;" title="关闭">关闭</a>' +
            '<div class="tip-mian">' +
            '<div class="p-shuju">' +
            '<div class="tipe-lb"><label>户型封面图：</label>' +
                '<div><span class="load_btn"> <span class="btn-cha J_upload"></span></span>' +
                    '<div class="J_display">' +
                        '<img src="" class="J_field" name="face_img" width="50" height="50" value="">' +
                    '</div>' +
                '</div>' +
            '</div>'+
            '<div class="layer-lb">' +
            '<label>户型名：</label>' +
            '<input class="inp-tex inp-300 J_field" name="name" type="text">' +
            '</div> ' +
            '<div class="layer-lb">' +
            '<label>户型分类：</label>' +
            '<input class="inp-tex inp-300 J_type" name="type" type="text">' +
            '</div>' +
            '<div class="layer-lb">' +
            '<label>户型简介：</label>' +
            '<input class="inp-tex inp-300 J_field" name="desc" type="text">' +
            '</div>' +
            '<div class="layer-lb">' +
            '<label>建筑面积：</label>' +
            '<input class="inp-tex inp-300 J_field" name="area" type="text">' +
            '</div>' +
            '<div class="layer-lb">' +
            '<label>套内面积：</label>' +
            '<input class="inp-tex inp-300 J_field" name="inner_area" type="text">' +
            '</div>' +
            '<div class="layer-lb">' +
            '<label>楼层：</label>' +
            '<input class="inp-tex inp-300 J_field" name="floors" type="text">' +
            '</div>' +
            '<div class="layer-lb">' +
            '<label>详细信息：</label>' +
            '<textarea class="layer-kuang J_field" name="detail" cols="" rows="" placeholder="100个字以内"></textarea>' +
            '</div>' +
            '</div>' +
            '<div class="lay-sctp">' +
            '<p><button class="btn-cha J_edit_type" type="button">编辑户型图</button></p>' +
            '<p><button class="btn-cha J_edit_all" type="button">编辑全景图</button></p>' +
            '(推荐图片尺寸：720*130；图片小于100k)' +
            '</div>' +
            '<div class="but-auto">' +
            '<a class="an-butn J_sure" href="javascript:;" title="确认">确认</a> ' +
            '<a class="an-butn J_cancel" href="javascript:;" title="取消">取消</a>' +
            '</div></div></div>').appendTo('body');
        WXAPP.bindLoad(layer.find('.J_upload'));

        if (data) {
            layer.find('.J_field').each(function (i, item) {
                $(item).val(data['base-info'][$(item).attr('name')]);
                if(item.nodeName.toLowerCase()==="img"){
                    item.src = 'upload_files/' + entity.estate_id + "/" +data['base-info'][$(item).attr('name')];
                }
            });
            layer.find('.J_type').val(type);
        } else {
            data = {
                'base-info': {},
                'panoramagram': [],
                'home-plan': []
            };
            type = "";
        }

        layer.find('.J_sure').click(function () {
            var type = $('.J_type').val();
            data['base-info'] = {};
            layer.find('.J_field').each(function (i, field) {
                data['base-info'][$(field).attr('name')] = $(field).val();
            });
            if (cb) {
                cb(data, type);
            }
            alert('编辑成功，不要忘记提交');
            layer.remove();
        });
        layer.find('.J_edit_all').click(function () {
            if (data) {
                showEditPanoramagram(data.panoramagram, function (newPa) {
                    data.panoramagram = newPa;
                });
            }
        });
        layer.find('.J_edit_type').click(function () {
            if (data) {
                showEditType(data['home-plan'], function (newPa) {
                    data['home-plan'] = newPa;
                });
            }
        });
        layer.find('.J_cancel').click(function () {
            layer.remove();
        })
    }

    function showEditType(data, cb) {
        var layer = $('<div class="box-layer" style="position:absolute;width:700px;top:'+($(window).scrollTop()+70) +';">'+
            ' <div class="title"><h2>户型图</h2></div>' +
            ' <a class="close J_cancel" href="javascript:;" title="关闭">关闭</a>' +
            ' <div class="tip-mian">' +
            ' <div class="p-shuju">' +
            ' </div>' +
            ' <div class="but-auto"><a class="an-butn J_add" href="javascript:;" title="添加">添加户型图</a> <a class="an-butn J_sure" href="javascript:;" title="确定">确定</a></div>' +
            ' </div> </div>').appendTo('body');
        var html = '<div class="J_item"><input class="J_field" name="name" >' +
            '<div><span class="load_btn"> <span class="btn-cha J_upload"></span></span>' +
            '<div class="J_display">' +
            '<img src="" class="J_field" name="img" width="50" height="50" value="">' +
            '</div></div><hr/>'
        '</div>';

        if (data) {
            data.forEach(function (item) {
                var list = $(html).appendTo(layer.find('.p-shuju'));
                list.find('.J_field').each(function (j, field) {
                    $(field).val(item[$(field).attr('name')]);
                    if (field.nodeName.toLowerCase() === "img") {
                        field.src = 'upload_files/' + entity.estate_id + "/" + item[$(field).attr('name')];
                    }
                });

            });
        }
        WXAPP.bindLoad(layer.find('.J_upload'));

        layer.find('.J_add').click(function () {
            var list = $(html).appendTo(layer.find('.p-shuju'));
            WXAPP.bindLoad(list.find('.J_upload'));
        });

        layer.find('.J_sure').click(function () {
            var list = [];
            layer.find('.J_item').each(function (i, item) {
                var data = {};
                $(item).find('.J_field').each(function (i, field) {
                    data[$(field).attr('name')] = $(field).val();
                });
                list.push(data);
            });
            alert('户型图修改成功');
            layer.remove();
            cb(list);
        });
        layer.find('.J_cancel').click(function () {
            layer.remove();
        })

    }

    function showEditPanoramagram(data, cb) {
        var layer = '<div class="box-layer" style="position:absolute;width:600px;top:'+($(window).scrollTop()+70) +';">'+
            ' <div class="title"><h2>户型数据</h2></div>' +
            ' <a class="close J_cancel" href="javascript:;" title="关闭">关闭</a>' +
            ' <div class="tip-mian">' +
            ' <div class="p-shuju">' +
            ' </div>' +
            ' <div class="but-auto"><a class="an-butn J_add" href="javascript:;" title="添加全景">添加全景</a> <a class="an-butn J_sure" href="javascript:;" title="确定">确定</a></div>' +
            ' </div>' +
            ' </div>';
        layer = $(layer).appendTo('body');
        var html = '<div class="J_item"><div class="layer-lb"><label>全景名称：</label> <input class="inp-tex inp-300 J_field" name="name" type="text"></div>' +
            '<div class="layer-lb"><label>访问地址：</label> <input class="inp-tex inp-300 J_field" name="link" type="text"></div></div>';

        if (data) {
            data.forEach(function (dataItem) {
                var item = $(html).appendTo(layer.find('.p-shuju'));
                item.find('.J_field').each(function (i, field) {
                    $(field).val(dataItem[$(field).attr('name')]);
                });
            });
        }
        layer.find('.J_add').click(function () {
            $(html).appendTo(layer.find('.p-shuju'));
        });
        layer.find('.J_sure').click(function () {
            var Panoramagram = [];
            layer.find('.J_item').each(function (i, item) {
                var data = {};
                $(item).find('.J_field').each(function (j, field) {
                    data[$(field).attr('name')] = $(field).val();
                });
                Panoramagram.push(data);
            });
            cb(Panoramagram);
            alert('全景图编辑成功!');
            layer.remove();
        });
        layer.find('.J_cancel').click(function () {
            layer.remove();
        })

    }

    function addAType (){
        edit(null, null, function (d, type) {
            var l = null
            holder.find(".J_loop").each(function (i, loop) {
                if ($(loop).find('.J_type_name').val() === type) {
                    l = $(loop);
                }
            });
            if (!l) {
                l = $(html).appendTo(holder);
            }
            l.find('.J_type_name').val(type);
            var list = $(typeList1).appendTo(l.find('ul'));
            list.find('.J_name').html(d['base-info'].name);
            list.find('input[type=hidden]').val(JSON.stringify(d));
            list.find('.J_edit').click(function () {
                edit(d, type, function (d) {
                    list.find('input[type=hidden]').val(JSON.stringify(d));
                });
            });
        });
    } 

    entity.setData = function (res) {
        var data = JSON.parse(res.content);
        var topImg = data.top_img;
        var types = data.types;
        var self = this;
        $('.J_field[name=top_img]').attr('src','upload_files/' + this.estate_id + "/" + topImg).val(topImg);
        holder.empty();
        types.forEach(function (typeData) {
            var l = $(html).appendTo(holder);
            l.find('.J_type_name').val(typeData.type_name);
            typeData.type_list.forEach(function (type) {
                var list = $(typeList1).appendTo(l.find('ul'));
                list.find('.J_name').html(type['base-info'].name);
                list.find('input[type=hidden]').val(JSON.stringify(type));
                list.find('.J_edit').click(function () {
                    edit(type, typeData.type_name, function (d) {
                        list.find('input[type=hidden]').val(JSON.stringify(d));
                    });
                });
            });
        });
    }

    entity.empty = function () {
        form.find('.J_holder').empty();
        addAType()
    };
})();

//专家点评
(function(){
    var html='<div class="J_module" data-module="expert">' +
        '<div class="tipe-lb"><label>专家头像：</label>' +
            '<div><span class="load_btn"> <span class="btn-cha J_upload"></span></span>' +
                '<div class="J_display">' +
                    '<img src="" class="J_field" name="img" width="50" height="50" value="">' +
                '</div>' +
            '</div>' +
        '</div>'+
        ' <div class="tipe-lb "><label>专家名字：</label> <input class="inp-tex inp-300 J_field" name="name" type="text">' +
        ' </div>' +
        ' <div class="tipe-lb"><label>专家头街：</label> <input class="inp-tex inp-300 J_field" name="title" type="text" placeholder="(10个字以内)">' +
        ' </div>' +
        ' <div class="tipe-lb"><label>专家介绍：</label> <textarea class="text-kuang J_field" name="desc" cols="" rows="" placeholder="100个字以内"></textarea>' +
        ' </div>' +
        ' <div class="tipe-lb"><label>点评标语：</label> <input class="inp-tex inp-300 J_field" name="c_title" type="text" placeholder="(15个字以内)">' +
        ' </div>' +
        ' <div class="tipe-lb"><label>点评内容：</label> <textarea class="text-kuang J_field" name="c_content" cols=""' +
        ' rows="" placeholder="100个字以内"></textarea></div>' +
        ' <a class="J_del_exp" href="javascript:;">删除</a><hr/></div>'

    var form = $('#J_expert_form'),
        newBtn = $('#J_entity_new'),
        table = $('#J_entity_table tbody');
    if (!form.length) {
        return;
    }
    form.find('.J_add').click(function(){
        entity.empty();
    });
    form.delegate('.J_del_exp','click',function(e){
        $(e.currentTarget).parent().remove();

    });
    var entity = new WXAPP.Entity(form.attr('data-type'), form, table, newBtn, {
        multiple: form.attr('data-multiple') === "true"
    });
    entity.setData = function(rs){
        if(rs){
            var data = JSON.parse(rs.content)
            data.forEach(function(expert){
                var l = $(html).appendTo(form.find('.J_expert_holder'));
                l.find('.J_field').each(function(i,field){
                    $(field).val(expert[$(field).attr('name')]);
                    if(field.nodeName.toLowerCase()==="img"){
                        field.src='upload_files/' + entity.estate_id + "/" + expert[$(field).attr('name')];
                    }
                });
            });
            WXAPP.bindLoad(form.find('.J_upload'))
        }
    }
    entity.getData = function(){
        var list = [];
        form.find('.J_module').each(function(i,module){
            var data = {};
            $(module).find('.J_field').each(function(i,field){
                data[$(field).attr('name')] = $(field).val();
            });
            list.push(data);
        });
        return list;
    }
    entity.empty = function(){
        $(html).appendTo(form.find('.J_expert_holder'));
        WXAPP.bindLoad(form.find('.J_upload'));
    }
})();

//多业态
(function(){
    var form = $('#J_ad_form'),
        newBtn = $('#J_entity_new'),
        table = $('#J_entity_table tbody');
    if (!form.length) {
        return;
    }
    form.find('.J_add').click(function(){
        editItem(null,function(data){
            var l = $('<li>已有业态：<span class="J_name">'+data.intro.name+'</span><input type="hidden"><button class="btn-cha J_edit" type="button">编辑</button></li>').appendTo(form.find('.J_list'));
            l.find('input[type=hidden]').val(JSON.stringify(data));
            l.find('.J_edit').click(function(){
                editItem(data,function(rs){
                    l.find('input[type=hidden]').val(JSON.stringify(rs));
                });
            });
        });
    });
    var entity = new WXAPP.Entity(form.attr('data-type'), form, table, newBtn, {
        multiple: form.attr('data-multiple') === "true"
    });

    entity.getData = function(){
        var data = {
            intro:{},
            list:[]
        };
        form.find('.J_list input[type=hidden]').each(function(i,input){
            data.list.push(JSON.parse(input.value));
        });
        form.find('.J_field').each(function(i,field){
            data.intro[$(field).attr('name')] = $(field).val();
        });
        return data;
    }
    entity.setData = function(rs){
        form.find('.J_list').empty();
        form.find('.J_field').val('');
        form.find('img').attr('src','');
        var listHtml = '<li>已有业态：<span class="J_name"></span><input type="hidden"><button class="btn-cha J_edit" type="button">编辑</button></li>';
        if(rs){
            var data = JSON.parse(rs.content);
            form.find('.J_intro .J_field').each(function(i,field){
                $(field).val(data.intro[$(field).attr('name')]);
                if(field.nodeName.toLowerCase()==="img"){
                    field.src='upload_files/' + entity.estate_id + "/" + data.intro[$(field).attr('name')];
                }
            });

            data.list && data.list.forEach(function(item){
                var l = $(listHtml).appendTo(form.find('.J_list'));
                l.find('.J_name').html(item.intro.name);
                l.find('input[type=hidden]').val(JSON.stringify(item));
                l.find('.J_edit').click(function(){
                    editItem(item,function(data){
                        l.find('input[type=hidden]').val(JSON.stringify(data));
                    });
                });
            });
        }
    }
    entity.empty = function(){
        form.find('.J_list').empty();
        form.find('.J_edit_holder').empty();
        form.find('.J_field').val('');
        form.find('img').attr('src','');
    }

    function editItem(data,cb){
        var html = '<div><hr/><div class="tipe-lb">' +
            '<div>' +
                '<span class="load_btn"> <span class="btn-cha J_upload"></span></span>(上传业态小图 推荐图片尺寸：720*130；图片小于100k)' +
                '<div class="J_display">' +
                    '<img src="" class="J_field" name="icon" width="50" height="50" value="">' +
                '</div>' +
            '</div></div>' +
            ' <div class="tipe-lb"><label>业态名称：：</label> <input class="inp-tex inp-300 J_field" name="name" type="text"></div>' +
            ' <div class="tipe-lb"><label>业态英文名：</label> <input class="inp-tex inp-300 J_field" name="ename" type="text"></div>' +
            '<div class="J_imgs"><a class="J_add_img" href="javascript:;">添加头图</a>'+
            '</div>'+
            ' <div class="tipe-lb"><label>添加业态简介：</label> <textarea class="text-kuang J_field" name="desc" cols="" rows=""></textarea></div>' +
             '<div class="box-table"><table width="360" border="0" cellspacing="1" cellpadding="0" bgcolor="#d7d7d7" style="margin-left:180px;">' +
            ' <thead><tr> <th>优惠名称</th> <th>状态</th></thead></tr><tbody></tbody></table></div>'+
            '<div class="tipe-lb">' +
            '<button class="btn-cha J_add_coupon" type="button">添加新优惠</button> <button class="btn-cha J_save" type="button">保存业态</button>' +
            '</div><hr/></div>';
        var titleImgHtml = '<div class="tipe-lb J_img_item">' +
            '<label>头图标题：</label><input class="J_title" type="text">'+
            '<div>' +
            '<span class="load_btn"> <span class="btn-cha J_upload"></span></span>(添加业态头图 推荐图片尺寸：720*130；图片小于100k)' +
            '<div class="J_display">' +
            '<img src="" class="J_img" name="img" width="50" height="50" value="">' +
            '</div>' +
            '</div>' +
            '</div>' ;

        var l = $(html).appendTo(form.find('.J_edit_holder').empty());
        l.find('.J_add_img').click(function(){
            var newImg = $(titleImgHtml).appendTo(l.find('.J_imgs'));
            WXAPP.bindLoad(newImg.find('.J_upload'));
        });

        if(data){
            l.find('.J_field').each(function(i,field){
                $(field).val(data.intro[$(field).attr('name')]);
                if(field.nodeName.toLowerCase()==="img"){
                    field.src='upload_files/' + entity.estate_id + "/" + data.intro[$(field).attr('name')];
                }
            });

            if(data.intro.imgs){
                data.intro.imgs.forEach(function(item){
                    var h = $(titleImgHtml).appendTo(l.find('.J_imgs'))
                        var img = h.find('.J_img');
                    img.val(item.url);
                    img.attr('src','upload_files/' + entity.estate_id + "/" + item.url);
                    var input = h.find('.J_title');
                    input.val(item.title);

                });
            }else{
                $(titleImgHtml).appendTo(l.find('.J_imgs'));
            }

            data.list && data.list.forEach(function(coupon){
                var couponItem = $('<tr><td><input type="hidden" >'+coupon.name+'</td><td><a class="J_edit" href="javascript:;">编辑</a> <a class="J_delete" href="javascript:;">删除</a></td></tr>').appendTo(l.find('tbody'));
                couponItem.find('input[type=hidden]').val(JSON.stringify(coupon));
                couponItem.find('.J_edit').click(function(){
                   editCoupon(coupon,function(data){
                       couponItem.find('input[type=hidden]').val(JSON.stringify(data));
                   });
                });
                couponItem.find('.J_delete').click(function(){
                    couponItem.remove();
                });
            });

        }
        WXAPP.bindLoad(l.find('.J_upload'));
        function getCoupon(){
            var data = [];
            l.find('table input[type=hidden]').each(function(i,hidden){
                data.push(JSON.parse(hidden.value));
            });
            return data;
        }

        l.find('.J_save').click(function(){
            var intro = {};
            intro.imgs = [];
            l.find('.J_field').each(function(i,field){
                intro[$(field).attr('name')] = $(field).val();
            });
            l.find('.J_imgs .J_img_item').each(function(i,item){
                intro.imgs.push({
                    url:$(item).find('img').val(),
                    title:$(item).find('.J_title').val()
                });
            });
            var list = getCoupon();
            cb({
                intro:intro,
                list:list
            });
            l.remove();
        });
        l.find('.J_add_coupon').click(function(){
            editCoupon(null,function(coupon){
                var couponItem = $('<tr><td><input type="hidden" >'+coupon.name+'</td><td><a class="J_edit" href="javascript:;">编辑</a> <a class="J_delete" href="javascript:;">删除</a></td></tr>').appendTo(l.find('tbody'));
                couponItem.find('input[type=hidden]').val(JSON.stringify(coupon));
                couponItem.find('.J_edit').click(function(){
                    editCoupon(coupon,function(data){
                        couponItem.find('input[type=hidden]').val(JSON.stringify(data));
                    });
                });
                couponItem.find('.J_delete').click(function(){
                    couponItem.remove();
                });
            });
        })
    }

    function editCoupon(data,cb){
        var layer = $('<div class="box-layer" style="width:700px;position:absolute;top:'+($(window).scrollTop()+70)+'px;">' +
            ' <div class="title"><h2>添加新优惠</h2></div>' +
            ' <a class="close J_cancel" href="javascrit:;" title="关闭">关闭</a>' +
            ' <div class="tip-mian">' +
            ' <div class="p-shuju">' +
            '<div class="layer-lb"><label>添加icon</label>' +
            '<span class="load_btn"> <span class="btn-cha J_upload"></span></span>' +
            '<div class="J_display">' +
            '<img src="" class="J_field" name="icon" width="50" height="50" value="">' +
            '</div>' +
            '</div>'+
            ' <div class="layer-lb"><label>优惠名称：</label> <input class="inp-tex inp-300 J_field" name="name" type="text"></div>' +
            ' <div class="layer-lb"><label>优惠描述：</label> <input class="inp-tex inp-300 J_field" name="desc" type="text"></div>' +
            ' <div class="layer-lb"><label>预约开始时间：</label> <input class="inp-tex inp-300 J_field" name="book_start_time" type="text"></div>' +
            ' <div class="layer-lb"><label>预约结束时间：</label> <input class="inp-tex inp-300 J_field" name="book_end_time" type="text"></div>' +
            ' <div class="layer-lb"><label>预约电话1：</label> <input class="inp-tex inp-300 J_field" name="phone1" type="text"></div>' +
            ' <div class="layer-lb"><label>预约电话2：</label> <input class="inp-tex inp-300 J_field" name="phone2" type="text"></div>' +
            ' <div class="layer-lb"><label>优惠说明：</label> <textarea class="layer-kuang J_field" name="announcement" cols="" rows=""></textarea></div>' +
            ' <div class="layer-lb"><label>优惠须知：</label> <textarea class="layer-kuang J_field" name="notice" cols="" rows=""></textarea></div>' +
            ' <div class="but-auto"><a class="an-butn J_save" href="javascript:;" title="提交">提交</a></div>' +
            ' </div> </div> </div>').appendTo('body');

        WXAPP.bindLoad(layer.find('.J_upload'));
        if(data){
            layer.find('.J_field').each(function(i,field){
                $(field).val(data[$(field).attr('name')]);
                if(field.nodeName.toLowerCase()==="img"){
                    $(field).attr('src','upload_files/' + entity.estate_id + "/" + data[$(field).attr('name')]);
                }
            });
        }
        layer.find('.J_save').click(function(){
            var data = {};
            layer.find('.J_field').each(function(i,field){
                data[$(field).attr('name')] = $(field).val();
            });
            cb(data);
            layer.remove();
        });
        layer.find('.J_cancel').click(function(){
            layer.remove();
        })
    }

})();

//看房团
(function(){
    var form = $('#J_watch_form'),
        newBtn = $('#J_entity_new'),
        table = $('#J_entity_table tbody');
    if (!form.length) {
        return;
    }
    form.find('.J_add_line').click(function(){
        createLine();
    });
    var entity = new WXAPP.Entity(form.attr('data-type'), form, table, newBtn, {
        multiple: form.attr('data-multiple') === "true"
    });
    form.delegate('.J_del_line','click',function(e){
        $(e.currentTarget).parent().parent().remove();
    });

    function createLine(){
        var html = '<div class="J_module_item">' +
            ' <div class="tipe-lb"><label>线路名称：</label> <input class="inp-tex J_field" name="name" type="text"><a class="J_del_line" href="javascript:;">删除线路</a></div>' +
            ' <div class="tipe-lb"><label>说明：</label> <textarea class="text-kuang J_field" name="tip" cols="" rows="" placeholder="500个字以内"></textarea></div>' +
            ' </div>'
        return $(html).appendTo(form.find('.J_lines'));
    }

    entity.setData = function(rs){
        WXAPP.Entity.prototype.setData.call(entity,rs);
        //设置lines
        if(rs){
            var content = JSON.parse(rs.content);
            var lines = content.lines;
            if(lines){
                $('.J_lines').empty();
                lines.forEach(function(line,i){
                        var lineDom = createLine();
                        lineDom.find('.J_field').each(function(i,field){
                            $(field).val(line[$(field).attr('name')])

                        });
                });
            }
        }
    }
    entity.tableTemplate = function (item) {
        var content = JSON.parse(item.content);
        return '<tr><td>' + content.title_setting.title + '</td><td>' + item.estate_name + '</td><td>' + content.event.watch_end_date + '前</td><td>' + item.create_time + '</td><td>' + this.getStatus(item.status) + '</td><td><a class="blue J_edit" href="javascript:;" data-id="' + item.id + '">编辑</a>' +
            '<a href="/weapp/php/cgi/preview.php?eid='+item.estate_id+'&t='+ item.type +'&gid='+item.group_id+'" target="_blank">预览</a>' +
            (item.status==1?' <a class="J_view" href="javascript:;" data-url="/weapp/php/cgi/jump.php?eid='+item.estate_id+'&t='+item.type+'&appid='+item.appid+'&gid='+item.group_id+'" target="_blank">查看</a>':'')+
            '</td></tr>';
    }
})();


//ugc 印象查询
(function(){
    $('.J_im_search').click(function(){
        var estate_id = $('.J_estate_list').val(),
            start_time = $('.ico-calendar').eq(0).prev().val(),
            end_time = $('.ico-calendar').eq(1).prev().val();

        if(estate_id===WXAPP.EMPTY_ESTATE){
            alert('请选择楼盘')
            return ;

        }
        WXAPP.Ajax('?r=impression/ajaxsearch',{
            estate_id:estate_id,
            start_time:start_time,
            end_time:end_time
        },function(rs){
            $('#J_im_result tbody').empty();
            var html = [];
            rs.data.forEach(function(item){
                html.push('<tr><td>'+item.customer_id+'</td><td>'+item.customer_nickname+'</td><td>'+item.impression+'</td><td>'+item.create_time+'</td></tr>');
            });
            $(html.join('')).appendTo($('#J_im_result tbody'));
            if(!rs.data.length){
                alert('没有数据');
            }

        });



    });

})();

//ugc 照片
(function(){
    $('.J_pic_search').click(function(){
        var estate_id = $('.J_estate_list').val(),
            start_time = $('.ico-calendar').eq(0).prev().val(),
            end_time = $('.ico-calendar').eq(1).prev().val();
        if(estate_id===WXAPP.EMPTY_ESTATE){
            alert('请选择楼盘');
            return ;
        }

        WXAPP.Ajax('?r=picwall/ajaxsearch',{
            estate_id:estate_id,
            start_time:start_time,
            end_time:end_time
        },function(rs){
            $('.J_list').empty();
            rs.data.forEach(function(item){
                var l = $('<span><img src="'+item.url+'"> <button class="btn-cha J_del" type="button">删除</button></span>').appendTo($('.J_list'));
                l.find('.J_del').click(function(){
                    WXAPP.Ajax('?r=picwall/ajaxdelete',{
                        id:item.id
                    },function(){
                        alert('删除成功');
                        l.remove();
                    });
                });
            });
            if(!rs.data.length){
                alert('没有数据');
            }
        });

    });
})();

//看房团查询
(function(){
    var watchList = $('.J_watch_list');
    if(watchList.length){
        $('.J_estate_list').change(function(){
            var id=$(this).val();
            if(id===WXAPP.EMPTY_ESTATE){
                return ;
            }

            WXAPP.Ajax('?r=watch/ajaxwatchlist',{
                estate_id:id
            },function(rs){
                watchList.empty();
                rs.data.forEach(function(watch){
                    var content = JSON.parse(watch.content);
                    watchList.append('<option value="'+watch.group_id+'">'+content.title_setting.title+'</option>');
                });

            });
        });
        $('.J_watch_search').click(function(){
            var estate_id = $('.J_estate_list').val(),
                group_id = watchList.val();
            if(estate_id===WXAPP.EMPTY_ESTATE || !group_id){
                return ;
            }
            WXAPP.Ajax('?r=watch/ajaxvisitsearch',{
                estate_id:estate_id,
                group_id:group_id
            },function(res){
                $('#J_visit_result tbody').empty();
                res.data.forEach(function(item){
                    $('<td>'+item.real_name+'</td><td>'+item.company+'</td><td>'+item.phone+'</td><td>'+item.route+'</td>').appendTo($('#J_visit_result tbody'));
                });
                if(!res.data.length){
                    alert('没有数据');
                }

            });

        });
    }
})();

(function(){
//other
    $('.J_other .J_estate_list').change(function(){
        var id = $(this).val();


        $('table tbody tr').hide().each(function(i, tr){
            if($(tr).attr('data-id')==id){
                $(tr).show();
            }

        });


    });
})();

//订单查询
(function(){

    $('.J_reservation_search .J_estate_list').change(function(){
        var id = $(this).val();
        if(id===WXAPP.EMPTY_ESTATE){
            return;
        }
        WXAPP.Ajax('?r=reservation/ajaxcountsearch',{
            estate_id:id
        },function(res){
            $('.J_count_list').empty();
            res.data.forEach(function(item,i){
                $('.J_count_list').append('<option value="'+item.group_id+'">第'+(i+1)+'期</option>')
            });

        });
    });
})();

//pv
(function(){
    var map = {
        'intro': '楼盘简介',
        'apartment': '户型',
        'group': '看房团',
        'picture': '照片墙',
        'reservation': '认筹',
        'comment': '专家建议',
        'impression': '用户印象',
        'advertise':'多业态',
        'bbs':'论坛',
        'userpicwall':'用户照片墙'
    };
    $('.J_search_pv').click(function(){
        var estate_id = $('.J_estate_list').val(),
            start_time = $('.J_start').val(),
            end_time = $('.J_end').val();

        WXAPP.Ajax('?r=statistic/ajaxsearch',{
            estate_id:estate_id,
            start_time:start_time,
            end_time:end_time
        },function(res){
            var table = $('#J_pv_table tbody').empty();
            var pv = res.data.pv;
            var uv = res.data.uv;
            pv.forEach(function(record){
                var thisUv = uv.filter(function(r){
                   return  r.page_name == record.page_name;
                });
                table.append('<tr><td>'+map[record.page_name]+'</td><td>'+thisUv[0].uv+'</td><td>'+record.pv+'</td></tr>')
            });
        });

    });
})();

//照片墙
(function(){
    var form = $('#J_picture_form'),
        newBtn = $('#J_entity_new'),
        table = $('#J_entity_table tbody');
    if (!form.length) {
        return;
    }
    var entity = new WXAPP.Entity(form.attr('data-type'), form, table, newBtn, {
        multiple: form.attr('data-multiple') === "true"
    });
    var template = $('.J_template');

    entity.setData = function(rs){
        var self = this;
        form.find('.J_wall').remove();
        if(rs){
            var data = JSON.parse(rs.content);
            data.forEach(function(wall,i){
                var thisWall = entity.clone(i>=3);
                thisWall.find('.J_field').each(function(i,field){
                    var value = wall[$(field).attr('name')];
                    $(field).val(value);
                    if ($(field).get(0).nodeName.toLowerCase() === "img" && value) {
                        $(field).attr('src', 'upload_files/' + self.estate_id + "/" + value);
                    }
                });
            });
            for(var i=3-data.length;i>0;i--){
                entity.clone();
            }
        }
    }
    entity.getData = function(){
        var data = [];
        this.form.find(".J_wall").each(function (i, wall) {
            var wallData={};
            $(wall).find('.J_field').each(function (j, field) {
                wallData[$(field).attr('name')] = $(field).val();
            });
            data.push(wallData);
        });
        return data;
    }
    entity.empty = function(){
        form.find('.J_wall').remove();
        for(var i=0;i<3;i++){
            this.clone();
        }
    }
    entity.clone = function(removable){
        var wall =  template.clone(false).insertBefore(template).addClass('J_wall').show();
        if(removable){
            wall.find('.J_delete').show();
        }
        WXAPP.bindLoad(wall.find('.J_up'));
        return wall;
    }

    form.find('.J_add_wall').click(function(){
        entity.clone(true);
    });
    form.on('click','.J_delete',function(){
        $(this).parent().parent().remove();
    });
})();
