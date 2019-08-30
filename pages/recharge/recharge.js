// pages/recharge/recharge.js

import pay from "../../utils/service.js";
import WXRQ from '../../utils/wxrq.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: '',
    prestore:0
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
      this.setData({
        prestore: options.prestore
      })

  },

  //   获得输入金额
  getMeney(e) {
    let money = e.detail.value;
    this.setData({
      money: money
    })
  },
  //  充钱
  chongMoney(e) {
    let num = this.data.money && this.data.money * 1 < '100' * 1 ? 0 : this.data.money * 1
    if (num) {
      pay.payMoney({
        url: 'order/pay/addUserDeposit',
        data: {
          formId: e.detail.formId,
          money: num*100
        },
        success: function(res) {
          WXRQ.payPCb(res.orderId).then(res=>{}).catch(err=>{
            console.error(err)
          })
        }
      })
    } else {
      wx.showToast({
        title: '充值金额最少100元',
        icon: 'none',
        duration: 2000
      })
    }

  },

})