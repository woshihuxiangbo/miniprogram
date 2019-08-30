// pages/refund_amend/refund_amend.js
import wxRepuest from '../../utils/wxrq.js';
import oss from '../../utils/oss.js';
let app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:'',
    ossUrl:'',
    picArr:[ ],
    causeid:-1,  // 原因项id
    classid:-1,  // 服务类型id
    popShow:true,  // 弹出遮罩是否显示
    itemShow:true,  // 弹出哪个选项列表
    btn:'btn1',// 哪个原因btn
    tuiYin:'请选择',  // 退款原因字符
    info:{},
    formData:{
        orderId:'',   // 订单id
        serviceType:'',  // 服务类型
        reason:'',       // 退款原因
        remark:'',       // 退款说明
        proof:''         // 图片
    },
    refundCause:[], // 退款原因
  },
  // 选择打开哪个弹框
  showService(e){
    
    
    let id = e.currentTarget.dataset.item;
    if(id== 'item0'){
      this.setData({ itemShow: false, btn: id})
    }else{
      this.setData({ itemShow: true, btn: id})
    }
    this.setData( {popShow:false})
  },
   //  选择服务类型
  selectCause(e){
    let causeid = e.currentTarget.dataset.causeid;
    this.setData({
        'formData.serviceType': causeid,
        causeid: causeid,
      })


  },
  selectCause2(e){
    let classid = e.currentTarget.dataset.classid;
    this.setData({
      classid: classid,
      'formData.reason': classid
    })
    switch (classid){
      case 1: this.setData({ tuiYin:'协商退货'});break;
      case 2: this.setData({ tuiYin:'缺货'});break;
      case 3: this.setData({ tuiYin:'未按约定时间发货'});break;
      case 4: this.setData({ tuiYin:'其他'});break;
    }

  },
  remarkFinish(e){
    this.setData({
      'formData.remark': e.detail.value
    })
  },
  // 关闭弹出选择(点击灰色遮罩)
  closePop(e){
    if(e.target.dataset.pop=='pop'){
      this.setData( {popShow:true})
    }
  },
  // 获取 子组件uppic里面传出的 图片数组
  getPicArr(data){
    let that = this
    let options = {
      type: 8,
      ID: this.data.orderId,
    }
    oss.getOssData(options).then((ossData) => {
      oss.upPicFile(ossData.ossUrl, ossData.ossObj, data.detail).then((ossUrlArr) => {
        // -------------
        that.setData({
          'formData.proof': ossUrlArr.join()
        })
        // -------------
      })
    })
  },
  // 获取
  getData(orderId){
    wxRepuest.getRefund(orderId).then(res=>{
        let info = res.data.data
        this.setData({ 
          info: info,
          refundCause: info.refundCause
        })
    })
  },
  // 服务
  refundApply(e){
    let whobtn = e.currentTarget.dataset.btn
    if (whobtn=='btn1'){
      //=================
      if (this.data.causeid == -1) {
        wx.showToast({
          title: '请选择服务类型',
          icon: 'none',
          duration: 1000
        })
      } else {
        this.setData({ popShow: !this.data.popShow })
      }
      //======================
    } else if (whobtn == 'btn2'){
      // --------------
      if (this.data.reason == -1) {
        wx.showToast({
          title: '请选择退款原因',
          icon: 'none',
          duration: 1000
        })
      } else {
        this.setData({ popShow: !this.data.popShow })
      }
      //--------------------
    }
    
     
  },
  // 提交
  submit(){
    if (!this.data.formData.serviceType){
      wx.showToast({
        title: '请选择服务类型',
        icon: 'none',
      })
    } else if (!this.data.formData.reason){
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none',
      })
    } else if (this.data.formData.serviceType && this.data.formData.reason){
      wxRepuest.goRefundApply(this.data.formData).then(res => {
          if(res.data.code==200){
            wx.showToast({
              title: '申请成功',
              icon: 'none',
            })
            if (this.returnd){
              wx.navigateBack({})
            }else{
              wx.navigateTo({
                url: `/pages/return/return?reOrderId=${res.data.data.id}&status=1`,
                success:res=>{
                  this.goreturn=true;
                }
              })
            }
           
          }
      })
  
    }
    
  },
  

  onLoad(e){
    e.type=='again' && (this.returnd=true);
    if (e.orderId){
      this.getData(e.orderId)
      this.setData({
        'formData.orderId':  e.orderId,    
        orderId: e.orderId,
        ossUrl: app.globalData.siteinfo.imgUrl
      })
      
    } 
    
    
  },
  onShow:function(){
    if (this.goreturn){
      wx.navigateBack({})
      this.goreturn=null;
    }
  }

})