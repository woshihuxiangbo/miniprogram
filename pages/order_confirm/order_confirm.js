// pages/order_confirm/order_confirm.js
import WXRQ from '../../utils/wxrq.js';
import Address from '../../model/address.js';
import PreOrder from '../../model/preOrder.js';
import PayStatus from '../../model/payStatus.js';
import Service from '../../utils/service.js';
import AreaCode from '../../utils/areaCode.js';
const app = getApp();

Page({
  waytype_1: [{ //普通商品
    id: 1,
    name: '线上支付',
    desc: '您可在线上支付，通过快递方式收货'
  }, {
    id: 2,
    name: '到店自提',
    desc: '您可在线上支付，自行到指定门店取货'
  }],
  //  {
  //   id: 3,
  //   name: '线下支付',
  //   desc: '您可在线下支付，现场提货'
  // }
  waytype_2: [{ //团购商品
    id: 1,
    name: '线上支付',
    desc: '您可在线上支付，通过快递方式收货'
  }, {
    id: 2,
    name: '到店自提',
    desc: '您可在线上支付，自行到指定门店取货'
  }],
  //  {
  //   id: 3,
  //   name: '团长家中自提',
  //   desc: '您可在线下支付，现场提货'
  // }
  waytype_3: [{ //仅能线上支付
    id: 1,
    name: '线上支付',
    desc: '您可在线上支付，通过快递方式收货'
  }],
  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: app.globalData.siteinfo.imgUrl,
    addrTabHide: true, //如果没有地址要提示 添加地址
    waytype: null,
    currentWaytype: 0,
    defultAddress: null,
    preOrder: null,
  },
  //数量变化
  // changeTap(e) {
  //   this.setData({
  //     totlePrice: (e.detail.value * this.data.goods.price).toFixed(2)
  //   })
  // },
  swichWaytype(e) {
    let currentWaytype = e.currentTarget.dataset.idx * 1;
    if (this.data.waytype[currentWaytype].id == 2 && !this.data.preOrder.addressSame) {
      wx.showToast({
        title: '商品不在同一个地方，不能选择到店自提',
        icon: 'none'
      })
    } else {
      this.setData({
        currentWaytype: currentWaytype
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      preOrder: PreOrder.preOrder, //将预订单 内容设置好
      waytype: this.init(options.eventType, options.payMethod),
      eventType: options.eventType || '',
      ossUrl: app.globalData.siteinfo.imgUrl,
    })
    this.getDefultAddress();
  },
  // 页面初始化 处理提货方式
  init(eventType, payMethod) {
    let waytype;
    if (eventType == 6) { //仅能线上购买 
      waytype = this.waytype_3;
    } else if (eventType == 3) { //团购商品
      waytype = [this.waytype_2[payMethod * 1 - 1]];
    } else { //普通商品
      waytype = this.waytype_1;
    }
    return waytype;
  },

  // 获取默认地址
  getDefultAddress() {
    WXRQ.getDefultAddress().then(res => {
      if (res.data.data) { //有默认地址
        let data = res.data.data;
        data.area = Number.isNaN(data.province * 1) ? [data.province, data.city, data.county] : AreaCode.codeToTxt([data.province, data.city, data.county]);
        this.setData({
          defultAddress: data
        })

        this.checkPostage();
      } else { //没有默认地址
        this.setData({
          addrTabHide: false
        })
      }
    }).catch(err => {
      console.error(err)
    })
  },
  //获取邮费
  checkPostage() {
    let payMethod = this.data.waytype[this.data.currentWaytype].id;
    if (payMethod == 2 || payMethod == 3) return;
    let data = this.data.preOrder.userStores[0].orderItems, //此处默认是一个店铺
      len = data.length,
      items = [];
    for (let i = 0; i < len; i++) {
      items.push({
        itemId: data[i].itemId,
        skuId: data[i].skuId,
        spuId: data[i].spuId,
        count: data[i].count,
        eventType: data[i].eventType,
        unit: data[i].unit || 1
      })
    }
    WXRQ.checkPostage({
      addrId: this.data.defultAddress.id,
      items: items,
      preOrderId: this.data.preOrder.id
    }).then(res => {
      this.setData({
        postage: res.data.data
      })
    }).catch(err => {
      console.error(err)
    })
  },
  ////支付
  payMoney(e) {
    if (this.payed) return;
    let value = e.detail.value,
      len = this.data.preOrder.userStores.length,
      waytype = this.data.waytype,
      currentWaytype = this.data.currentWaytype,
      keystr = len > 1 ? "_top" : currentWaytype == 0 ? "_2" : "_3";
    //1 线上  2 到店  3线下
    console.log(keystr, value)
    if (waytype[currentWaytype].id == 2) { //到店自提
      if (!value[`name${keystr}`]) { //姓名检查
        wx.showToast({
          title: `请输入取货人姓名`,
          icon: 'none'
        })
        return;
      }

      if (!(/^1\d{10}/.test(value[`phone${keystr}`]))) { //检查电话
        wx.showToast({
          title: `请输入正确的电话号码`,
          icon: 'none'
        })
        return;
      }
    }

    if (waytype[currentWaytype].id == 1) { //线上支付
      if (!this.data.defultAddress) {
        wx.showToast({
          title: '请选择有效地址',
          icon: 'none'
        })
        return;
      }
      if (!(this.data.hasOwnProperty('postage'))) return;
    }
    let userStoreInfo = [];
    for (let j = 0; j < len; j++) {
      userStoreInfo.push({
        message: value[`message${keystr}`],
        payMethod: waytype[currentWaytype].id,
        userStoreId: this.data.preOrder.userStores[j].userStoreId,
        userStoreType: this.data.preOrder.userStores[j].userStoreType,
        phone: value[`phone${keystr}`],
        userName: value[`name${keystr}`],
      })
    }
    this.payed = true; //不可重复点击支付
    WXRQ.payMoney({
      payChannel: 1, //1 微信支付  2 支付宝
      payMethod: waytype[currentWaytype].id, //支付方式
      addrId: (this.data.defultAddress && this.data.defultAddress.id) || '',
      formId: e.detail.formId,
      preOrderId: this.data.preOrder.id,
      userStoreInfo: userStoreInfo
    }).then(res => {
      PayStatus.pay = true;
      if (waytype[currentWaytype].id * 1 < 3) { //付款成功
        let price;
        if (res.moneyPaid) {
          price = res.moneyPaid;
        } else {
          price = this.data.preOrder.calcAmount.payAmount;
          (waytype[currentWaytype].id == 1) && (price = price * 1 + (this.data.postage * 1 || 0));
        }
        wx.navigateTo({
          url: `/pages/order_finishied/order_finishied?price=${(price/100).toFixed(2)}&orderId=${res.orderId}&eventType=${this.data.eventType}&payMethod=${waytype[currentWaytype].id}`,
          success: res => {
            this.payNav = true;
          }
        })
      } else { //确认订单成功
        wx.navigateTo({
          url: `/pages/orderDetail/orderDetail?id=${res.orderId}`,
          success: res => {
            this.payNav = true;
          }
        })
      }

    }).catch(err => {
      if (waytype[currentWaytype].id * 1 < 3) { //支付失败
        wx.showModal({
          title: '',
          content: '订单已失效，请重新购买商品！',
        })
      }
      if (err.orderId) {
        wx.navigateTo({
          url: `/pages/orderDetail/orderDetail?id=${err.orderId}`,
          success: res => {
            this.payNav = true;
          }
        })
      } else {
        wx.navigateBack({})
      }
    })
  },
  //去选择更换地址
  selectAddress() {
    if (this.data.defultAddress) { //有默认地址则去列表页
      wx.navigateTo({
        url: `/pages/address/address?type=order&id=${this.data.defultAddress.id}`,
        success: res => {
          this.toAddress = true;
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/addAddress/addAddress',
        success: res => {
          this.toAddress = true;
        }
      })
    }
  },
  //取消选择地址
  cancelAddress() {
    this.setData({
      addrTabHide: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.toAddress) { //去选择过地址
      let data = Address.selectAddress;
      if (data) {
        data.area = Number.isNaN(data.province * 1) ? [data.province, data.city, data.county] : AreaCode.codeToTxt([data.province, data.city, data.county]);
        this.setData({
          defultAddress: data
        })
        this.toAddress = false;
        this.checkPostage();
        Address.orderAdIdDel = null;
      } else if (Address.orderAdIdDel) { //没有选中新地址，并且原本地址还被删除了
        this.setData({
          defultAddress: null
        })
        this.getDefultAddress();
        Address.orderAdIdDel = null;
      }
    }
    if (this.payNav) { //支付过要卸载当前页面
      wx.navigateBack({})
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
  //聚焦  //失焦
  focusTap_1(e) {
    this.setData({
      focus_1: true
    })
  },
  blurTap_1(e) {
    if (!e.detail.value) {
      this.setData({
        focus_1: false
      })
    }
  },
  //聚焦  //失焦
  focusTap_2(e) {
    this.setData({
      focus_2: true
    })
  },

  blurTap_2(e) {
    if (!e.detail.value) {
      this.setData({
        focus_2: false
      })
    }
  },
  //聚焦//失焦
  focusTap_3(e) {
    this.setData({
      focus_3: true
    })
  },

  blurTap_3(e) {
    if (!e.detail.value) {
      this.setData({
        focus_3: false
      })
    }
  }
})