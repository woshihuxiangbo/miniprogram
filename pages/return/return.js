// pages/return/return.js
import Service from '../../utils/service.js';
import WXRQ from "../../utils/wxrq.js";
import OSS from "../../utils/oss.js";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    AppName: '',
    tips: ['商家同意后，请按照给出的地址退货，并请记录退货运单号', '如商家拒绝，您可以修改申请后再次发起，商家会重新处理', '如商家超时未处理，退货申请将达成，请按系统给出的退货地址退货'],
    delivery: [{
      context: '未获取到地址111',
      time: ''
    }],
    icon: '',
    deliveryArr: null, //快递选择
    currentDelivery: null
  },

  /**   
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      AppName: app.globalData.AppName,
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    this.reOrderId = options.reOrderId;
    this.status = options.status;
    this.difStatus();
  },
  onShow: function() {
    if (this.goed) {
      Service.endCountDate();
      this.difStatus();
      this.goed = false;
    }
  },
  difStatus() {
    switch (this.status * 1) {
      case 1: //申请中
        this.getDetail();
        this.setData({
          icon: 'wait'
        })
        break;
      case 2: //等待卖家确认
        this.getDetail();
        this.setData({
          icon: 'wait'
        })
        break;
      case 3: //撤销申请
        this.getDetail();
        this.setData({
          icon: 'tuiclose'
        })
        break;
      case 4: //卖家拒退;
        this.getDetail();
        this.setData({
          icon: 'tuiclose'
        })
        break;
      case 5: //退款申请达成，等待买家发货
        this.editDelivery();
        this.setData({
          icon: 'dui'
        })
        break;
      case 6: //买家已退货，等待卖家确认收货
        this.editDelivery();
        this.setData({
          icon: 'wait'
        })
        break;
      case 7: //待平台处理退款
        this.returnMoney();
        this.setData({
          icon: 'wait'
        })
        break;
      case 8: //退款中
        this.returnMoney();
        this.setData({
          icon: 'wait'
        })
        break;
      case 9: //退款失败
        this.getDetail();
        this.setData({
          icon: 'tuiclose'
        })
        break;
      case 10: //退款成功
        this.getDetail();
        this.setData({
          icon: 'dui'
        })
        break;
      case 11: //商家处理超时，自动同意
        this.editDelivery();
        this.setData({
          icon: 'tinout'
        })
        break;
      default:
        return '其他'
    }
  },
  /**
   * 
   * 待确认
   * 
   */
  // 获取详情
  getDetail() {
    WXRQ.getRefundDetails(this.reOrderId).then(res => {
      let info = res.data.data;
      if (info.status != this.status) { //如果本地携带状态与后台返回状态不同
        this.status = info.status;
        this.difStatus();
        return;
      }
      this.setData({
        status: info.status,
        info: info
      })
      //serviceType  1 退款，2 退款且退货
      if (info.serviceType == 1 || info.status >= 7) {
        wx.setNavigationBarTitle({
          title: "退款进度"
        })
      } else {
        wx.setNavigationBarTitle({
          title: "退货进度"
        })
      }
      if (info.status * 1 < 3) {
        Service.startCountDate({
          thisObj: this,
          endDate: [info.dateTimeEnd * 1000]
        })
      }
    })
  },
  // 撤销申请
  cancelTap() {
    wx.showModal({
      title: '',
      content: '撤销后，如果问题仍未解决，您还可以再次发起，确定撤销吗？',
      success: res => {
        if (res.confirm) {
          WXRQ.cancelRefund({
            id: this.reOrderId
          }).then(res => {
            wx.showToast({
              title: '撤销成功',
              icon: 'none'
            })
            this.getDetail();
            this.setData({
              icon: 'tuiclose'
            })
          }).catch(err => {
            console.error(err)
          })
        }
      }
    })
  },
  /**
   * 
   * 商家同意退货  &&  等待卖家收货
   * 
   */
  editDelivery() {
    WXRQ.agreeRefund(this.reOrderId).then(res => {
      let data = res.data.data;
      if (data.status != this.status) { //如果本地携带状态与后台返回状态不同
        this.status = data.status;
        this.difStatus();
        return;
      }
      this.orderExpressId = data.refundOrderExpress.id; //物流管理id
      let expressName, expressId;
      if (this.status == 6 && data.refundOrderExpress.expressCode) {
        let expressCompanyList = data.expressCompanyList;
        let expressCode = data.refundOrderExpress.expressCode;
        for (let i = 0; i < expressCompanyList.length; i++) {
          if (expressCode == expressCompanyList[i].code) {
            expressName = expressCompanyList[i].name;
            expressId = data.refundOrderExpress.expressId;
            break;
          }
        }
      }
      this.setData({
        status: data.status,
        deliveryArr: data.expressCompanyList,
        seller: data.refundOrderExpress.receiver.value,
        delivery: data.kuaidi,
        expressName: expressName || '',
        expressId: expressId || ''
      })
      //serviceType  1 退款，2 退款且退货
      if (data.serviceType == 1 || data.status >= 8) {
        wx.setNavigationBarTitle({
          title: "退款进度"
        })
      } else {
        wx.setNavigationBarTitle({
          title: "退货进度"
        })
      }
    }).catch(err => {
      console.error(err)
    })
  },
  //选择物流
  deliveryChange(e) {
    this.setData({
      currentDelivery: e.detail.value
    })
  },
  //上传图片
  getPicArr(e) {
    this.pic = e.detail;
  },
  // 提交
  submit(e) {
    let value = e.detail.value;
    value.id = this.orderExpressId;
    value.refundId = this.reOrderId;
    value.expressCode = this.data.deliveryArr[this.data.currentDelivery].code;
    OSS.getOssData({
      type: 8,
      query: `ID=${this.reOrderId}`,
    }).then(res => {
      OSS.upPicFile(res.ossUrl, res.ossObj, this.pic).then(res => {
        value.proof = res.join();
      }).catch(err => {
        console.error(err)
      })
    })

    WXRQ.submitRefund(value).then(res => {
      this.editDelivery();
      this.setData({
        icon: 'wait'
      })
    }).catch(err => {
      console.error(err)
    })
  },
  /**
   * 
   * 商家拒接退货
   * 
   */

  /**
   * 
   * 退款进度 7 8
   *
   */
  returnMoney(data) {
    WXRQ.returMoney({
      id: this.reOrderId
    }).then(res => {
      if (this.status != res.data.data.refundOrder.status) {
        this.status = data.status;
        this.difStatus();
        return;
      }
      this.setData({
        delivery: res.data.data.logList,
        refond: res.data.data.refundOrder,
        status: res.data.data.refundOrder.status
      })
      wx.setNavigationBarTitle({
        title: "退款进度"
      })

    }).catch(err => {
      console.error(err)
    })
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    Service.endCountDate();
  },
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.info.mobile
    })
  },
  //修改申请
  putRight() {
    wx.navigateTo({
      url: `/pages/amend_apply/amend_apply?reOrderId=${this.reOrderId}`,
      success: res => {
        this.goed = true;
      }
    })
  },
  // 重新发起申请
  againAmend() {
    wx.navigateTo({
      url: `/pages/amend_apply/amend_apply?reOrderId=${this.reOrderId}&type=again`,
      success: res => {
        this.goed = true;
      }
    })
    // wx.navigateTo({
    //   url: `/pages/refund_amend/refund_amend?orderId=${this.data.info.refundDetail.orderid}&type=again&reOrderId=${this.reOrderId}`,
    //   success: res => {
    //     this.goed = true;
    //   }
    // })
  }
})