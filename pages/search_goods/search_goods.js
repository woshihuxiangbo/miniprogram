// pages/search_goods/search_goods.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      datas:{
        historyGoods:[ 
          { name:'雅漾喷雾',goodsId:1161},
          { name:'iphone6 64G 土豪金',goodsId:1161},
          { name:'大白菜xxxxx',goodsId:1161},
          { name:'华为荣耀v10',goodsId:1161},
        ],
        recommendGoods:[
          { name:'iphone6 64G 土豪金',goodsId:1161},
          { name:'大白菜xxxxx',goodsId:1161},
        ]
      },
    searchs:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({
      searchs: wx.getStorageSync('searchList') || []
    })
  },
  searchgoods(e){
    let goodsName = e.detail.value;
    if (!goodsName){
      return
    }
    if (wx.getStorageSync('searchList').length>8){
      let searchList = this.data.searchs
      searchList.unshift(goodsName)
      searchList.pop()
      this.setData({
        searchs: searchList
      })
      wx.setStorageSync('searchList', this.data.searchs);
      wx.navigateTo({
        url: `/pages/searchresult/searchresult?goodsName=${goodsName}`,
      })
    }else{
      let searchList = this.data.searchs
      searchList.unshift(goodsName)
      this.setData({
        searchs: searchList
      })
      wx.setStorageSync('searchList', this.data.searchs);
      wx.navigateTo({
        url: `/pages/searchresult/searchresult?goodsName=${goodsName}`,
      })
    }
  },

  closeHistory(){
    wx.setStorageSync('searchList', [])
    this.setData({
      searchs:[]
    })

  },



})