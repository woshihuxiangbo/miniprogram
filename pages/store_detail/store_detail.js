// pages/store_detail/store_detail.js
import wxRepuest from '../../utils/wxrq.js';
import CommonService from '../../utils/common.js';
import Service from '../../utils/service.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuShow: false,
    goodsList: [],
    totalGoods: 0,
    menuGoods: [],
    headData: {},
    menuActiveId: '',
    more: false,
    isRecommendNum: 0,
    isNewNum: 0,
    recommend: null,
    recAtive: false,
    newActive: false,
    allActive: true,
  },
  page: 1,
  pageSize: 5,
  totalPage: 1,
  tabFlag: 0,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    CommonService.checkLoadFinsh(() => {
      this.setData({
        ossUrl: app.globalData.siteinfo.imgUrl,
        shopUid: options.userid,
        ownerId: options.ownerId //小店主人
      })
      this.getSales();
      this.getList({
        page: 1,
        pageSize: this.pageSize,
      });
      // 得到菜单
      wxRepuest.getGoodsCategory({
        parentId: 0,
        ownerId: this.data.shopUid
      }).then(res => {
        this.setData({
          menuGoods: res.data.data.rows || []
        })
      })
      // 得到推荐数量
      wxRepuest.getGoodsList({
        isRecommend: 1,
        ownerId: this.data.shopUid
      }).then(res => {
        this.setData({
          isRecommendNum: res.data.data.rowCount
        })
      })
      // 得到上新数量
      wxRepuest.getGoodsList({
        isNew: 1,
        ownerId: this.data.shopUid
      }).then(res => {
        this.setData({
          isNewNum: res.data.data.rowCount
        })
      })
      // 得到所有商品数量
      wxRepuest.getGoodsList({
        ownerId: this.data.shopUid
      }).then(res => {
        this.setData({
          totalGoods: res.data.data.rowCount
        })
      })
    })
  },

  getSales() {
    wxRepuest.getSales({
      userId: this.data.shopUid
    }).then(res => {
      this.setData({
        headData: res.data.data || null
      })
    }).catch(err => {
      console.error(err)
    })
  },
  openMenu() {
    this.setData({
      menuShow: !this.data.menuShow,
      recAtive: false,
      newActive: false,
      allActive: true
    })
  },
  // 推荐数量
  getRecommend() {
    this.setData({
      newActive: false,
      allActive: false,
      recAtive: true,
      menuShow: false,
    })
    this.page = 1
    this.totalPage = 1
    this.tabFlag = 1
    this.setData({
      goodsList: []
    })
    this.getList({
      page: 1,
      pageSize: 5,
      isRecommend: 1,
    })
  },
  // 上新
  getNew() {
    this.setData({
      recAtive: false,
      allActive: false,
      newActive: true,
      menuShow: false,
    })
    this.page = 1
    this.totalPage = 1
    this.tabFlag = 2
    this.setData({
      goodsList: []
    })
    this.getList({
      page: 1,
      pageSize: 5,
      isNew: 1,
    })
  },
  // 得到商品列表
  getList(data) {
    if (this.totalPage < this.page) {
      this.setData({
        more: true,
      })
      console.log('没有更多了')
      return
    }
    data.ownerId = this.data.shopUid //  全部加上ownerID参数
    wxRepuest.getGoodsList(data).then(res => {
      this.totalPage = Math.ceil(res.data.data.rowCount / this.pageSize)
      let list = res.data.data.rows
      if (list) {
        this.setData({
          goodsList: [...this.data.goodsList, ...list],
          // totalGoods: res.data.data.rowCount
        })
      }
    })
  },
  // 进去菜单分类
  goCategory(e) {
    let categoryId = e.currentTarget.dataset.id
    console.log('categoryId:', categoryId)
    this.setData({
      menuActiveId: categoryId
    })
    this.page = 1
    this.totalPage = 1
    this.setData({
      goodsList: []
    })
    this.getList({
      page: 1,
      pageSize: 5,
      categoryId: categoryId,
    })
  },
  getAll() {
    this.setData({
      goodsList: []
    })
    this.page = 1
    this.totalPage = 1
    this.getList({
      page: 1,
      pageSize: 5
    })
  },
  onReachBottom() {
    if (this.tabFlag == 1) {
      this.getList({
        page: ++this.page,
        pageSize: this.pageSize,
        isRecommend: 1,
        ownerId: this.data.shopUid
      })
    } else if (this.tabFlag == 2) {
      this.getList({
        page: ++this.page,
        pageSize: this.pageSize,
        isNew: 1,
        ownerId: this.data.shopUid
      })
    } else {
      this.getList({
        page: ++this.page,
        pageSize: this.pageSize,
      })
    }
  },
  onShow() {
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    if (e.from == 'button' && this.shareGoodsStatus) {
      // console.log(`fuid=${this.data.ownerId}&skuId=${this.data.shareGoods.skuId}&eventType=1`)
      return {
        title: this.data.shareGoods.name,
        imageUrl: this.data.ossUrl + this.data.shareGoods.thumbnail,
        path: `/pages/goodsDetail/goodsDetail?fuid=${this.data.ownerId}&skuId=${this.data.shareGoods.skuId}&eventType=1`
      }
    }
    let shareInfo = wx.getStorageSync('shareInfo');
    console.log(`ownerId=${this.data.ownerId}&userid=${this.data.shopUid}`)
    return {
      title: Service.convertText(shareInfo.shareTitle, app.globalData.AppName),
      imageUrl: this.data.ossUrl + shareInfo.sharePic,
      path: `/pages/store_detail/store_detail?ownerId=${this.data.ownerId}&userid=${this.data.shopUid}`
    }
  },
  //分享 包括右下角的分享 与 分享赚
  shareTap(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (e.currentTarget.dataset.share == 'share') { //推荐商品的分享
        let data = this.data.goodsList;
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
  }
})