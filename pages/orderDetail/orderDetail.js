// pages/orderDetail/orderDetail.js
import siteinfo from '../../siteinfo.js'
import wxRepuest from '../../utils/wxrq.js';
import Service from '../../utils/service.js';
import Order from '../../model/order.js';
import qrcode from '../../utils/qrcode.js';
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconUrl: '',
    ossUrl: '',
    icons: ['http://img.chuangxiaozhu.com/wxapp/icons/icons_2/wait.png', 'delivery.png', 'dui.png'],
    orderDetail: null,
    orderId: '',
    qrcodeUrl: '',

    orderArr: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //  -------------------- 订单列表传参部分 ---------------------
    this.orderId = options.id || options.orderId;
    let ossUrl = app.globalData.siteinfo.imgUrl;
    let qrcodeUrl = `${siteinfo.mgtUrl}order/info?orderId=${this.orderId}`
    let qrcode0 = qrcode.outputQRCodeBase64(qrcodeUrl, {
      size: 600,
      padding: 16,
    });
    this.setData({
      orderId: this.orderId,
      qrcodeUrl: qrcode0,
      iconUrl: `${ossUrl}/wxapp/icons/`,
      ossUrl: ossUrl,
    })
    //  -------------------- 订单列表传参部分 ---------------------
    this.getOrder();
  },
  // 获取详情
  getOrder() {
    wxRepuest.getOrderDetail({
      id: this.orderId
    }).then((data) => {

      let orderArr = data.data.data || []
      this.setData({
        orderDetail: orderArr[0],
        orderArr: orderArr // 返回的订单数组 
      })
    }).catch((err) => {
      console.error(err);
    })
  },
  returnMoney(e) {
    let id = e.currentTarget.dataset.orderid
    wx.navigateTo({
      url: `/pages/refund_amend/refund_amend?orderId=${id}`,
      success: res => {
        this.gode = true;
      }
    })
  },

  btnTap(e) {
    let key = e.currentTarget.dataset.key * 1;
    switch (key) {
      case 1:
        break;
      case 2: //取消订单
        wx.navigateTo({
          url: `/pages/cancel_order/cancel_order?orderId=${this.orderId}&type=detail`,
          success: res => {
            this.gode = true;
          }
        })
        break;
      case 3: //支付
        this.goPay();
        break;
      case 4: //4查看取货码
        break;
      case 5: //5确认收货
        wxRepuest.okOrder({
          id: this.orderId
        }).then(res => {
          this.getOrder();
        }).catch(err => {
          console.error(err);
        })
        break;
      case 6: //6查看物流
        wx.navigateTo({
          url: `/pages/look_logistics/look_logistics?orderId=${this.orderId}`,
        })
        break;
      case 7: //7去评价
        Order.items = this.data.orderDetail.items;
        wx.navigateTo({
          url: `/pages/go_comment/go_comment?orderId=${this.orderId}`,
          success: res => {
            this.gode = true; //记录返回本页面的时候 刷新页面
          }
        })
        break;
      case 8: //8再次购买
        // wx.navigateTo({
        //   url: '/pages/goodsDetail/goodsDetail?skuId=&goodsId=&eventType=',
        // })
        break;
      case 9: //9删除订单
        wx.showModal({
          title: '提示',
          content: '删除订单后，订单信息将从您的订单列表移除',
          success: (res) => {
            if (res.confirm) {
              this.deleteOrder(this.orderId);
            }
          }
        })
        break;
    }
  },
  // 删除订单
  deleteOrder(id) {
    wxRepuest.deleteOrder({
      id: id
    }).then(res => {
      wx.showToast({
        title: '删除成功',
        icon: 'none'
      })
      this.getOrder();
    }).catch(err => {
      console.error(err)
    })
  },
  // 去付款
  goPay() {
    wxRepuest.rePay(
      this.data.orderDetail.paySn
    ).then(res => {
      wx.navigateTo({
        url: `/pages/order_finishied/order_finishied?orderId=${res.orderId}&price=${(this.data.orderDetail.amount / 100).toFixed(2)}&eventType=${this.data.orderDetail.eventType}`,
      })
    }).catch(err => {
      this.getOrder();
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.gode) {
      this.getOrder();
      this.gode = false;
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.timout && clearTimeout(this.timout);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
})