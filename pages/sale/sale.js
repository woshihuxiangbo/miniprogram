// pages/sale/sale.js
import CommonService from '../../utils/common.js';
import WXRQ from '../../utils/wxrq.js';
import Service from '../../utils/service.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    swiperTopauto: true,
    ossUrl: '',
    stayHidden: true, //敬请期待
    bannerHeight: null,
    banner_list: null,
    category: null,
    currentItem: null,
    items: null,
    isLast: false,
    scroll_top: 0,
    // 方块布局新增字段
    layout: 'items', //items 或 square
    squareItems: null //{name,items}

  },

  //切换分类
  swichTab(e) {
    let dataset = e.currentTarget.dataset;
    if (dataset.id != this.data.currentItem.id) {
      this.page_totle = null;
      this.page = 1;
      this.setData({
        items: null,
        currentItem: dataset,
        isLast: false
      })
      this.setTitle();
      this.getGoodsList();
    }
  },
  //方块布局逻辑
  nextCategory() {
    if (this.data.category.length == this.data.squareItems.length) { //到底了
      this.setData({
        isLast: true
      })
      return;
    }

    this.page_totle = null;
    this.page = 1;
    this.setData({
      currentItem: this.data.category[this.data.squareItems.length]
    })
    // this.setTitle();
    this.getGoodsList();
  },
  // 监听标题节点
  // listenerTitle() {
  //   let query = wx.createSelectorQuery().selectAll('.catitle').boundingClientRect(res=>{
  //     console.log(res)
  //   }).exec()
  // },

  goTop(e) {
    this.setData({
      scroll_top: 0
    })
  },
  goGoodsDetail(e) {
    let type = e.target.dataset.share;
    if (type == 'share') return;
    let id = e.currentTarget.dataset.id;
    let skuId = e.currentTarget.dataset.skuid;
    wx.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?goodsId=${id}&skuId=${skuId}&eventType=1&fuid=${this.fuid}`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.hideShareMenu()
    this.fuid = options.fuid || '';
    /**初始化数据 */
    this.parentId = options.categoryId;
    this.setData({
      currentItem: {
        id: options.categoryId,
        name: options.name
      },
      ossUrl: app.globalData.siteinfo.imgUrl,
      currentTitle: options.name
    })

    /**对应操作方法 */
    this.setTitle();
    this.getBanner();

    let myIsStore = wx.getStorageSync('myIsStore');
    let uid = wx.getStorageSync('uid');
    this.getCategory();
    this.getGoodsList();
  },
  /**加载banner */
  getBanner() {
    WXRQ.getIndexBanner({
      advId: '2100'
    }).then((res) => {
      this.setData({
        banner_list: res.data.data.rows
      })
    })
  },
  /**加载分类列表 */
  getCategory() {
    WXRQ.getCategory({
      pageSize: 100,
      parentId: this.parentId,
      column: `id,name,sortId`,
      sortOrder: 'sortId',
      sortBy: 'DESC',
    }).then(res => { //获取 类别 及 banner
      let category = res.data.data.rows;
      category && category.length ? category.unshift(this.data.currentItem) : (category = [this.data.currentItem]);
      this.setData({
        category: category
      })
    }).catch(err => {
      console.error(err)
    })
  },
  categoryId: null,
  /**分页加载商品列表*/
  page_totle: null,
  page: 1,
  getGoodsList() {
    if (this.data.isLast || this.loading) return;
    if (this.page_totle != null && this.page > this.page_totle * 1) {
      if (this.data.layout == "square") {
        this.nextCategory();
      } else if (this.data.layout == "items") {
        this.setData({
          isLast: true
        })
      }
      return;
    }
    this.loading = true;
    wx.showLoading({
      title: '加载中',
    })
    WXRQ.getGoodsList({
      categoryId: this.data.currentItem.id,
      page: this.page,
      pageSize: 10
    }).then(res => { //获取商品
      wx.hideLoading();
      this.loading = false;

      // layout: 'square',  //items 或 square
      if (this.data.layout == "items") { //旧版布局
        this.page_totle == null && (this.data.items = null); //切换种类后要清空商品列表
        this.data.items && (this.data.items = this.data.items.concat(res.data.data.rows));
        this.setData({
          items: this.data.items || res.data.data.rows,
          stayHidden: (this.data.items || (res.data.data.rows && res.data.data.rows.length)) ? true : false
        })
      } else if (this.data.layout == "square") { //方块布局
        this.data.squareItems || (this.data.squareItems = []);
        let idx = this.data.squareItems.length - 1;
        if (idx >= 0 && this.data.currentItem.id == this.data.squareItems[idx].name.id) { //同一分类
          this.setData({
            [`squareItems[${idx}].items`]: this.data.squareItems[idx].items.concat(res.data.data.rows)
          })
        } else { //新的分类
          let item = {
            name: this.data.currentItem,
            items: res.data.data.rows
          }
          this.setData({
            [`squareItems[${idx + 1}]`]: item
          })
          if (!res.data.data.rows || !res.data.data.rows.length) {
            this.nextCategory();
            return;
          }  
        }

        if (!this.goodsLen || this.goodsLen <= 8) { //页面商品不够8个
          this.goodsLen || (this.goodsLen = 0);
          this.goodsLen += res.data.data.rows.length;
          if (this.goodsLen <= 8){
            this.nextCategory();
            return;
          }
        }
 
      }
      this.page_totle || (this.page_totle = Math.ceil(res.data.data.rowCount / 10));
      this.page++;
    }).catch(err => {
      wx.hideLoading();
      console.error(err)
    })
  },
  bannerLoad(e) { //banner适应屏幕
    if (this.data.bannerHeight) return;
    let bannerHeight = app.globalData.phoneInfo.screenWidth * 0.92 * (e.detail.height / e.detail.width);
    this.setData({
      bannerHeight: bannerHeight
    })
    bannerHeight = null;
  },

  goBanner(e) {
    const self = this
    let Index = e.currentTarget.dataset.index
    let name = e.currentTarget.dataset.name
    let bannerArr = self.data.banner_list
    if (bannerArr[Index].linkType) {
      let type = bannerArr[Index].linkType
      switch (type) {
        case 1:
          //文章
          wx.navigateTo({
            url: `/pages/xz_single/xz_single?articleId=${bannerArr[Index].articleId}&name=${name}`,
          })
          return
        case 2:
          //商品
          wx.navigateTo({
            url: '/pages/goodsDetail/goodsDetail?goodsId=' + (bannerArr[Index].id || 1) + '&skuId=' + bannerArr[Index].skuId,
          })
          return
        case 3:
          //活动
          wxRepuest.getActivityListOther(bannerArr[Index].eventId).then((res) => {
            let eventType = res.data.data.rows[0].type
            if (eventType == 5) {
              wx.navigateTo({
                url: '/pages/power_2/power_2?a=' + 1 + '&eventId=' + bannerArr[Index].eventId,
              })
            } else if (eventType == 6) {
              wx.navigateTo({
                url: '/pages/free_gift2/free_gift2?eventId=' + bannerArr[Index].eventId,
              })
            }
          })
          return
      }
    }
  },
  //设置标题方法
  setTitle() {
    wx.setNavigationBarTitle({
      title: this.data.currentItem.name
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
    wx.getSetting({
      success: res => {
        let noPhotosAlbum = wx.getStorageSync('noPhotosAlbum');
        if (res.authSetting['scope.writePhotosAlbum']) { //受过权
          noPhotosAlbum && wx.removeStorageSync('noPhotosAlbum');
          this.setData({
            noPhotosAlbum: false
          })
        } else { //没受过权
          if (noPhotosAlbum) { //询问过
            this.setData({
              noPhotosAlbum: noPhotosAlbum
            })
          } else { //没询问过
            this.setData({
              noPhotosAlbum: false
            })
          }
        }
      }
    })

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    if (e.from == 'button' && this.shareGoodsStatus) { //分享商品
      let myIsStore = wx.getStorageSync('myIsStore');
      let uid = wx.getStorageSync('uid');
      let fuid = (myIsStore == '1') ? uid : (app.globalData.storeInfo ? app.globalData.storeInfo.userId : uid);
      return {
        title: this.data.shareGoods.name,
        imageUrl: this.data.ossUrl + this.data.shareGoods.thumbnail,
        path: `/pages/goodsDetail/goodsDetail?fuid=${fuid}&skuId=${this.data.shareGoods.skuId}&eventType=1`
      }
    }
    return Service.shareObj();
  },

  //分享 包括右下角的分享 与 分享赚
  shareTap(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (e.currentTarget.dataset.share == 'share') { //推荐商品的分享
        let data = this.data.items;
        for (let i = 0; i < data.length; i++) {
          if (data[i].skuId == e.currentTarget.dataset.skuid) {
            this.setData({
              shareGoods: data[i]
            })
            this.shareGoodsStatus = true;
            break;
          }
        }
      }
      this.setData({
        shareBarShow: true
      })
    })

  },
  savImg(e) {
    if (this.shareGoodsStatus) { //商品分享
      this.setData({
        doCvs: this.data.doCvs ? false : true
      })
    } else { //右下角分享
      this.setData({
        cvsShow: true
      })
    }

  },
  closePoster(e) {
    this.setData({
      shareBarShow: false
    })
    this.shareGoodsStatus = null;
  },
  // 轮播视频处理
  videoStart() {
    this.setData({
      swiperTopauto: false
    })
  },
  videoEnd() {
    this.setData({
      swiperTopauto: true
    })
  }
})