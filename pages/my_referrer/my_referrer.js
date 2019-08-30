// pages/my_referrer/my_referrer.js
import wxrq from '../../utils/wxrq.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    info:{
      header:'',
      nickname:'',
      wechatQrcode:'',
      signature:'',
    }


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wxrq.getLinkman().then((res)=>{
      let info = res.data.data;
      if(info){
        that.setData({
          header: info.header,
          nickname: info.nickname,
          wechatQrcode: info.wechatQrcode,
          signature: info.signature,
        })
      }
    }).catch((err)=>{

    })
  },

})