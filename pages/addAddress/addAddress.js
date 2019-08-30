// pages/addAddress/addAddress.js
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
    region: [],
    address: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (Address.editAddress) { //编辑地址
      this.setData({
        address: Address.editAddress,
        region: Number.isNaN(Address.editAddress.province * 1) ? [Address.editAddress.province, Address.editAddress.city, Address.editAddress.county] : AreaCode.codeToTxt([Address.editAddress.province, Address.editAddress.city, Address.editAddress.county])
      })
      this.regionCode = [Address.editAddress.province, Address.editAddress.city, Address.editAddress.county];
    }
  },
  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    })
    this.regionCode = e.detail.code;
  },
  submitTap(e) { //提交
    let value = e.detail.value;
    let reg = /^1\d{10}/.test(value.mobile);
    if (!value.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      })
    } else if (!reg) {
      wx.showToast({
        title: '请输入正确的电话号码',
        icon: 'none',
        duration: 2000
      })
    } else if (!this.regionCode) {
      wx.showToast({
        title: '请选择所在省市区',
        icon: 'none',
        duration: 2000
      })
    } else if (!value.details || value.details.length < 5) {
      wx.showToast({
        title: '详细地址不满足5-120字符之间',
        icon: 'none',
        duration: 2000
      })
    } else {
      value.province = this.regionCode[0];
      value.city = this.regionCode[1];
      value.county = this.regionCode[2];
      this.data.address && this.data.address.id && (value.id = this.data.address.id); //编辑
      //请求
      WXRQ.submitAddress(value).then(res => {
        if (value.id) { //编辑
          Address.editAddress = null;
          Address.selectAddress = value;

        } else { //新增
          Address.selectAddress = value;
          Address.selectAddress.id = res.data.data;
        }
        wx.navigateBack({});
      }).catch(err => {
        console.error(err);
      })

    }
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


})