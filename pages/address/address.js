// pages/address/address.js
import Address from '../../model/address.js';
import WXRQ from '../../utils/wxrq.js';
import Service from '../../utils/service.js';
import AreaCode from '../../utils/areaCode.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    adaptNum: 3, //再不滚动的条件下最大地址数量
    addressList: null,
    currentId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.adapt();
    if (options.type == 'order') { //订单页来的
      this.setData({
        type: options.type,
        orderAdressId: options.id
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getAddressList();
  },
  //适配手机
  adapt() {
    let screenHeight = app.globalData.phoneInfo.screenHeight;
    let adaptNum = Math.floor(screenHeight * 0.8 / 139);
    if (adaptNum > 3) {
      this.setData({
        adaptNum: adaptNum
      })
    }
  },
  // 获取地址列表
  getAddressList() {
    WXRQ.getAddressList().then(res => { //更新地址列表
      let data = res.data.data;
      if (data && data.length) {
        let currentId, idx;
        for (let i = 0; i < data.length; i++) {
          if (Number.isNaN(data[i].province * 1)) {
            data[i].area = [data[i].province, data[i].city, data[i].county];
          } else {
            data[i].area = AreaCode.codeToTxt([data[i].province, data[i].city, data[i].county])
          }

          if (data[i].isDefault * 1) {
            currentId = data[i].id;
            idx = i;
          }
        }
        let item = data.splice(idx, 1);
        data.unshift(item[0]);
        this.setData({
          addressList: data,
          currentId: currentId || 0
        })
      }

    }).catch(err => {
      console.error(err)
    })
  },
  //删除
  deleteTap(e) {
    let idx = e.currentTarget.dataset.idx * 1;
    wx.showModal({
      title: '提示',
      content: '确认删除该条地址？',
      cancelText: '手滑了',
      confirmText: '删除',
      success: (res) => {
        if (res.confirm) {
          WXRQ.deleteAddress(this.data.addressList[idx].id).then(res => {
            if (this.data.orderAdressId == this.data.addressList[idx].id) {
              Address.orderAdIdDel = true; //确认订单选中的id被删除
              Address.selectAddress = null;
            }

            this.data.addressList.splice(idx, 1);
            this.setData({
              addressList: this.data.addressList || '',
              currentId: res.data.id
            })
          }).catch(err => {
            console.error(err)
          })
        }
      }
    })
  },
  //编辑
  editTap(e) {
    let idx = e.currentTarget.dataset.idx * 1;
    Address.editAddress = this.data.addressList[idx];
    wx.navigateTo({
      url: `/pages/addAddress/addAddress`
    })
  },
  //新增
  goaddAddress() {
    Address.editAddress = null;
    wx.navigateTo({
      url: '/pages/addAddress/addAddress'
    })
  },
  //切换默认地址
  swichSelect(e) {
    let id = e.currentTarget.dataset.id;
    if (id != this.data.currentId) {
      WXRQ.editDefultAddress(id).then(res => {
        this.setData({
          currentId: id
        })
      }).catch(err => {})
    }

  },
  //选择该地址
  tapFn(e) {
    let idx = e.currentTarget.dataset.idx;
    Address.selectAddress = this.data.addressList[idx];
    wx.navigateBack({})
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

  }
})