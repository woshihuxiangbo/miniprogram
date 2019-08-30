// pages/go_comment/go_comment.js
import oss from '../../utils/oss.js';
import wxRepuest from '../../utils/wxrq.js';
let app = getApp();
import Order from '../../model/order.js';
Page({

  data: {
    ossUrl: '',
    body: '',
    isAnonymous: false,
    imgs: [],
  },

  onLoad: function(options) {
    this.orderId = options.orderId
    this.setData({
      goodsList: Order.items,
      ossUrl: app.globalData.siteinfo.imgUrl
    })
  },


  // //获取详情
  // getOrder(orderId) {
  //   wxRepuest.getOrderDetail(orderId).then((res) => {
  //     this.setData({
  //       orderDetail: res.data.data
  //     })
  //   }).catch((err) => {
  //     console.error(err);
  //   })
  // },
  anonymSelect() {
    this.setData({
      isAnonymous: !this.data.isAnonymous
    })
  },
  // 获取上传图片组件数据
  getPicArr(data) {
    this.picArr = data.detail
  },
  picArr: [],
  // 上传图片
  textareaInp(e) {

    this.setData({
      body: e.detail.value
    })
  },
  goComment() {
    let options = {
      type: 9,
      ID: this.orderId,
    }
    if (!this.data.body) {
      wx.showToast({
        title: '请填入内容',
        icon: 'none',
        duration: 2000
      })

      return
    }
    let data = {
      orderId: this.orderId,
      body: this.data.body,
      isAnonymous: this.data.isAnonymous,
      imgs: []
    }
    if (this.picArr.length == 0) {
      wxRepuest.gobuyordercomment(data).then(res => {
        wx.navigateBack({})
      })
    }

    oss.getOssData(options).then((ossData) => {

      oss.upPicFile(ossData.ossUrl, ossData.ossObj, this.picArr).then((ossUrlArr) => {
        this.setData({
          imgs: ossUrlArr
        })
        //去评论
        let data = {
          orderId: this.orderId,
          body: this.data.body,
          isAnonymous: this.data.isAnonymous,
          imgs: ossUrlArr || []
        }
        wxRepuest.gobuyordercomment(data).then(res => {
          wx.navigateBack({})
        })
        //去评论

      })




    })
  },



})