<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>微信 房产管理后台</title>
    <link rel="stylesheet" href="css/styler.css" type="text/css" />
    <link rel="stylesheet" href="css/ui-lightness/jquery-ui-1.10.3.custom.min.css" type="text/css" />

</head>
<body>
<!-- 头部 【【-->
<div class="header">
    <div class="com-cent">
        <div class="hd-title">微信 房产管理后台</div>
        <div class="hd-log">欢迎你<span>亲爱的<em><?php echo Yii::app()->user->getUserName();?></em>用户</span><a href="?r=site/changepassword">修改密码</a>  <a href="?r=site/logout">退出</a></div>
        <ul class="hd-link">
            <li><a href="index.php">首页</a></li>
        </ul>
    </div>
</div>
<!-- 头部 】】-->
<!-- 二级菜单【【 -->
<div class="box-menu">
    <div class="com-menu">
        <ul class="menu">
            <li class="menu-p"><a href="?r=estate/create">楼盘管理</a>
                <ul class="menu-xia">
                    <li><a href="?r=estate/create">新增楼盘</a></li>
                    <li><a href="?r=estate/view">楼盘详情</a></li>
                    <li><a href="?r=estate/type">户型管理</a></li>
                </ul>
            </li>
            <li><a href="?r=watch/create">看房团管理</a></li>
            <li class="curr menu-p"><a href="#none">楼盘印象管理</a>
                <ul class="menu-xia">
                    <li><a href="?r=impression/view">房友印象查询</a></li>
                    <li><a href="?r=impression/create">房友印象设置</a></li>
                    <li><a href="?r=expert/create">专家点评管理</a></li>
                </ul>
            </li>
            <li class="menu-p">
                <a href="order_li.html">认筹管理</a>
                <ul class="menu-xia"  >
                    <li><a href="?r=reservation/create">认筹列表</a></li>
                    <li><a href="order.html">认筹订单</a></li>
                </ul>
            </li>
            <li class="menu-p">
                <a href="?r=picwall/create">照片管理</a>
                <ul class="menu-xia" >
                    <li><a href="photo_inquiry.html">照片查询</a></li>
                    <li><a href="?r=picwall/create">照片管理</a></li>
                </ul>
            </li>
            <li><a href="new.html">多页态</a></li>
        </ul>
    </div>
</div>
<!-- 二级菜单 】】 -->
<?php echo $content; ?>
<script src="js/jquery-2.0.3.min.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="js/upload/swfupload.js"></script>
<script src="js/base.js" charset="utf-8"></script>
</body>
</html>

