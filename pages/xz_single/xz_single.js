// pages/xz_single/xz_single.js
import wxRepuest from '../../utils/wxrq.js';
Page({


  data: {
    content: '',
    noword: false,
  },

  onLoad: function(options) {
    if (options.id) {
      this.id = options.id;
      this.getSingleData();
    } else if (options.articleId) {
      this.getArticleOne(options.articleId)
    }

    wx.setNavigationBarTitle({
      title: options.name
    })
  },
  getSingleData() {
    let that = this;
    wxRepuest.getArticleList(this.id).then(res => {
      if (res.data.data.rows) {
        let info = res.data.data.rows[0];
        that.getArticleOne(info.id);
      } else {
        that.setData({
          noword: true
        })
      }
    }).catch(err => {
      console.error(err)
      that.setData({
        noword: true
      })
    })
  },
  getArticleOne(articleId) {
    let that = this;
    wxRepuest.getArticleOne(articleId).then(res => {
      if (res.data.data) {
        let info = res.data.data;
        that.setData({
          content: info.body.replace(/\<img/gi, '<img style="max-width:100%;height:auto"')
        })
      } else {
        that.setData({
          noword: true
        })
      }
    }).catch(err => {
      console.error(err)
    })
  }

})