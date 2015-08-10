/**
 * Created by Administrator on 2015/3/10.
 */

/** 定义写常量, 以供程序调用 */
var totalActivityPageCount = 1;     // 初始化的活动选择页面总页数
var activityNumberPerPage = 10;		// 活动列表每页显示的图片数量
var currentActivityPage = 1;		// 活动弹出框的当前页数

var DayMillionTime = 3600*24*1000;	//	一天的毫秒数 
var picFilterOptions = {};			// 用户图片查询参数
var totalPicPageCount = 1;          // 初始化的图片选择页面总页数
var picNumberPerPage = 10;          // 图片选择页面的总页数
/**
 * 初始化基本的点击功能
 */
function init() {
    // 选择推送类型, 触发点击的操作
    var $ActivityPicId = $('#ActivityPicId');
    var $SelectActionBtn = $('#SelectActionBtn');
    var $SelectPicBtn = $('#SelectPicBtn');
    var $ActivityPicImg = $('#ActivityPicImg');


    // 推送类型 单击事件
    $('#TypeAction').click(function() {
        $ActivityPicId.val('').attr('disabled', false);
        $ActivityPicId.attr('placeholder', '请输入活动ID');
        $SelectActionBtn.css('display', 'inline-block');
        $SelectPicBtn.css('display', 'none');
        $ActivityPicImg.attr('src', '');
    });
    $('#TypePic').click(function() {
        $ActivityPicId.val('').attr('disabled', false);
        $ActivityPicId.attr('placeholder', '请输入图片ID');
        $SelectActionBtn.css('display', 'none');
        $SelectPicBtn.css('display', 'inline-block');
        $ActivityPicImg.attr('src', '');
    });
    $('#TypeText').click(function() {
        $ActivityPicId.val('').attr('disabled', true).attr('placeholder', '');
        $SelectActionBtn.css('display', 'none');
        $SelectPicBtn.css('display', 'none');
        $ActivityPicImg.attr('src', '');
    });

    // 推送对象 点击事件
    var $allAudience = $('#AllAudience');
    var $singlePerson = $('#SinglePerson');
    var $userUuid = $('#UserUuid');

    $allAudience.click(function() {
        $userUuid.attr('disabled', true);
        $userUuid.val('');
    });
    $singlePerson.click(function() {
        $userUuid.attr('disabled', false);
    });
};

/**
 * 初始化图片搜索过滤参数
 */
function initSearchPicParams() {
    // 初始化时间参数
    var currentDate = new Date(),
        yesterday = new Date(currentDate.getTime() - DayMillionTime);
    var beginDate = getFormatDate(yesterday),
        endDate = getFormatDate(currentDate);
    $('#BeginDate').val(beginDate);
    $('#EndDate').val(endDate);

    // 设置过滤参数
    picFilterOptions.username = '';
    picFilterOptions.begin_date = beginDate;
    picFilterOptions.end_date = endDate;
    picFilterOptions.sort_mode = $('#SortMode').val()
    picFilterOptions.page_num = 1;
    picFilterOptions.recommend = false;
}

/**
 * 初始化分页插件
 */
function initBootpag() {
    $('#ActivityPaging').bootpag({
        total: totalActivityPageCount,
        maxVisible: 10
    }).on('page', function(e, num) {
        var $activityPaging = $('#ActivityPaging');
        // 判断是否为第一页或最后一页-----设置pre和next
        if(num == 1) {
            $activityPaging.find('ul>li:first').addClass('disabled');
        }
        if(num == totalActivityPageCount) {
            $activityPaging.find('ul>li:last').addClass('disabled');
        }

        // 得到审核图片容器
        var $activityContainer = $('#ActivityContainer');

        // step1: 清空已加载的图片
        $activityContainer.empty();

        // step2: 设置分页参数
        currentActivityPage = num;

        // step3: 请求点击页数据并加载
        requestActivityData();
    });

    $('#PicPaging').bootpag({
        total: totalPicPageCount,
        maxVisible: 10
    }).on('page', function(e, num) {
        var $picPaging = $('#PicPaging');
        // 判断是否为第一页或最后一页-----设置pre和next
        if(num == 1) {
            $picPaging.find('ul>li:first').addClass('disabled');
        }
        if(num == totalPageCount) {
            $picPaging.find('ul>li:last').addClass('disabled');
        }

        // 得到审核图片容器
        var $imgContainer = $('#img-view-container');

        // step1: 清空已加载的图片
        $imgContainer.empty();

        // step2: 设置分页参数
        picFilterOptions.page_num = num;
    });
};

/**
 * 初始化modal
 */
function initModal() {
    $('#SelectActivityModal').on('hidden.bs.modal', function() {
        console.log('close SelectActivityModal');
    });

    $('#SelectPicModal').on('hidden.bs.modal', function() {
        console.log('close SelectPicModal');
    });
};

/**
 * 显示选择推广活动的modal
 */
function showSelectActivityModal() {
    // 弹出模态层窗口
    $('#SelectActivityModal').modal({
        backdrop: 'static',
        keyboard: true,
        show: true
    });
    // 请求用户数据并显示
    requestActivityData();
};
/**
 * 确认选择推广的活动
 */
function confirmActivity() {
    // 取得选中的图片
    var $img = $('.singleActivityDiv').find('img.selected:first');
    if($img.length == 0) {
        alert('活动不能为空, 请重新选择!');
        return;
    }

    // 关闭模态框
    $('#SelectActivityModal').modal('hide');

    // 取得数据并设置到输入框. 显示活动图片
    $('#ActivityPicId').val($img.attr('id'));
    $('#ActivityPicImg').attr('src', $img.attr('src'));
};

/**
 * 点击活动图片, 显示遮罩层
 */
function picSelected(_this) {
    var $_this = $(_this);
    $('.singleActivityDiv').find('span.pic-mask').css('display', 'none');
    $('.singleActivityDiv').find('img.selected').removeClass('selected');
    $_this.addClass('selected');
    $_this.next().show();
};

/**
 * 创建单个活动内容div
 */
function createSingleActivityDiv(data) {
    return '<div class="singleActivityDiv">' +
        '<img class="single-img" id="'+data.activity_uuid+'"src="' + data.url +'" onclick="picSelected(this)">' +
        '<span class="pic-mask"></span>' +
        '<span class="activity-title">' + data.activity_title + '</span>' +
        '<span class="activity-date">' + data.createtime + '</span>' +
        '</div>';
};

/**
 * 修改分页参数的总数
 */
function setActivityPageCount(count) {
    var totalCount = 0;
    if(count%picNumberPerPage == 0) {
        totalCount = count/picNumberPerPage;
    } else {
        totalCount = Math.floor(count/picNumberPerPage) + 1;
    }
    if(totalPicPageCount != totalCount) {
        totalPicPageCount = totalCount;
        $('#ActivityPaging').bootpag({total: totalPicPageCount});
    }
}

/**
 * 取得活动列表数据
 */
function requestActivityData() {

    // 显示遮罩层modal
    showMaskModal('正在加载活动, 请稍后...');

    // 取得活动数据
    $.ajax({
        url: 'getActivityListByPage',
        type: 'post',
        dataType: 'json',
        data: {
            page_num : currentActivityPage
        },
        success: function(data) {
            if(data.code == SYS_SUCCESS) {
                // 得到活动列表容器
                var $activityContainer = $('#ActivityContainer');
                $activityContainer.empty();

                // 设置分页插件的总数
                setActivityPageCount(data.totalCount);

                // 加载活动列表
                var result = data.data;
                for(var i=0; i<result.length; i++) {
                    $activityContainer.append(createSingleActivityDiv(result[i]));
                }
            } else {
                alert('请求活动数据失败!')
            }
        },
        error: function() {
            alert(FAILURE_MSG);
        },
        complete: function() {
            hideMaskModal();
        }
    });
};

/**
 * 显示选择推广图片的modal
 */
function showSelectPicModal() {
    // 弹出模态层窗口
    $('#SelectPicModal').modal({
        backdrop: 'static',
        keyboard: true,
        show: true
    });
    // 请求图片数据并显示
    requestPicData();
};
/**
 * 选择推广的图片
 */
function selectPic() {

};



/**
 * 修改图片展示界面分页参数的总数
 */
function setPicPageCount(count) {
    var totalCount = 0;
    if(count%activityNumberPerPage == 0) {
        totalCount = count/activityNumberPerPage;
    } else {
        totalCount = Math.floor(count/activityNumberPerPage) + 1;
    }
    if(totalActivityPageCount != totalCount) {
        totalActivityPageCount = totalCount;
        $('#PicPaging').bootpag({total: totalActivityPageCount});
    }
}

/**
 * 点击'搜索图片'触发函数
 */
function searchPics() {
    picFilterOptions.username = $('#UserName').val();
    picFilterOptions.begin_date = $('#BeginDate').val();
    picFilterOptions.end_date = $('#EndDate').val();
    picFilterOptions.sort_mode = $('#SortMode').val()
    picFilterOptions.page_num = 1;
    var $recommend = $('#Recommend');
    if($('#Recommend')[0].checked) {
        picFilterOptions.recommend = true;
    } else {
        picFilterOptions.recommend = false;
    }

    totalPicPageCount = 1;
    $('#PicPaging').bootpag({
        total: 1,
        maxVisible: 10
    });

    // 请求数据并显示
    requestPicData();
}

/**
 * 创建单个图片Div
 */
function createSinglePicDiv(data) {
    var buttonStr = '';
    if(data.pic_type == 1) {
        buttonStr = '<button class="btn btn-default btn-xs">正常</button>';
    } else if(data.pic_type == 2) {
        buttonStr = '<button class="btn btn-default btn-xs" disabled>已置顶</button>';
    } else if(data.pic_type == 3) {
        buttonStr = '<button class="btn btn-default btn-xs" disabled>已推荐</button>';
    }
    return '<div class="singlePicDiv">' +
        '<span class="commment-count">' + data.comment_count + '</span>' +
        '<img class="single-img" id="'+data.pic_uuid+'"src="' + data.url +'" onclick="picSelected(this)">' +
        '<span class="pic-mask" onclick="cancelSelected(this)"></span>' +
        '<a href="javascript:void(0);" onclick="showUserManagerModal(this)">' +
        '<span class="span-inline" user_uuid ="'+data.user_uuid+'" head_img="'+data.head_img+'" super_user="' + data.super_user + '">' + data.nick_name +  '</span>' +
        '</a>' +
        buttonStr +
        '<span class="pic-date">' + data.createtime + '</span>' +
        '</div>';
}

/**
 * 取得用户图片列表数据
 */
function requestPicData() {

    // 显示遮罩层modal
    showMaskModal('正在加载图片, 请稍后...');

    $.ajax({
        url: '/getAuditPicsByPage',
        type: 'post',
        dataType: 'json',
        data: {
            username: picFilterOptions.username,
            begin_date: picFilterOptions.begin_date,
            end_date: picFilterOptions.end_date,
            sort_mode: picFilterOptions.sort_mode,
            page_num: picFilterOptions.page_num,
            recommend: picFilterOptions.recommend
        },
        success: function(data) {
            if(data.code == SYS_SUCCESS) {
                // 得到图片容器
                var $picViewContainer = $('#PicViewContainer');
                $picViewContainer.empty();

                // 初始化分页插件
                setPicPageCount(data.totalCount);

                // 显示图片
                var result = data.data;
                for(var i=0; i<result.length; i++) {
                    $picViewContainer.append(createSinglePicDiv(result[i]));
                }
            } else {
                alert('请求图片失败');
            }
        },
        error: function() {
            alert(FAILURE_MSG);
        },
        complete: function() {
            hideMaskModal();
        }
    });
};

/**
 * 发送推送
 */
function sendPush() {
    // 取得参数
    var notification = $('#Notification').val();
    var push_type = $('#PushTypeDiv input[name="sendType"]:checked').val();
    var audience = $('#PushAudienceDiv input[name="pushAudience"]:checked').val();
    var user_uuid = $('#UserUuid').val();
    var push_time = $('#Pushtime').val();
    var extra_data = '';

    // 传输参数
    $.ajax({
        url: '/createSendPush',
        type: 'POST',
        dataType: 'json',
        data: {
            push_type: push_type,
            audience: audience,
            notification: notification,
            user_uuid: user_uuid,
            push_time: push_time,
            extra_data: extra_data
        },
        success: function(data) {
            alert('success');
        },
        error: function() {
            alert('error');
        },
        complete: function() {
            alert('complete');
        }
    });
}

$(function() {
    init();
    initBootpag();
    initSearchPicParams();
});