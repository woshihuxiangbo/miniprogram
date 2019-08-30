// pages/tg_store/tg_store.js
import wxRepuest from '../../utils/wxrq.js';
const app = getApp();
import CommonService from '../../utils/common.js';
import Service from '../../utils/service.js';
let STRSHORT = require('../../utils/strShort.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fuid: '',
    ossUrl: '',
    goods: [],
    tab: [
      '生活用品', '零食甜品', '家具电器', '美妆护肤', '身体保健', '身体保健', '身体保健'
    ],
    tabNum: 0,
    goodsContent: null,
    id: '',
    broadcastList: [],
    tuanFlag: null,
    modalHidden: true
  },

  //获取团购店铺信息
  findStore(fuid) {
    wxRepuest.findStore({ //优先级：userId,token,token上级，平台
      userId: fuid || '',
      type: 2 // 1普通小店 2团购小店'
    }).then(res => {
      let store = res.data.data,
        tuanFlag;
      if (store.userId == fuid && store.userId != wx.getStorageSync('uid')) { //userid的店铺
        app.globalData.groupStoreInfo = store;
        wxRepuest.isLeader().then(res => {
          if (res.data.data.leaderJudge != 1 && !res.data.data.disabled) { //自己是团长
            //此处不做缓存的团长身份区分，因为当前在别人店铺下，不需要自己的身份及店铺信息,单纯处理一下tuanFlag，
            //否则还要缓存自己的信息（不开空头支票，即没有拿到自己的店铺信息，不缓存自己是否有店铺）
            this.setData({
              tuanFlag: false
            })
          }
        }).catch(err => {
          console.error(err)
        })
      } else if (store.userId == wx.getStorageSync('uid')) { //我自己的店铺
        wx.setStorageSync('myIsGroup', "1");
        wx.setStorageSync('myGroupStore', store);
      } else if (store.userId == store.userStoreId) { //查到了平台
        wx.setStorageSync('myIsGroup', "0");
        app.globalData.groupStoreInfo = null;
        tuanFlag = true;
      } else { //查到了上级
        wx.setStorageSync('myIsGroup', "0");
        app.globalData.groupStoreInfo = store;
        tuanFlag = true;
      }

      store.logo = store.logo.startsWith('http') ? store.logo : this.data.ossUrl + store.logo;
      this.name = store.name;
      this.navTitle = `${store.name}的团购小店`;
      this.setData({
        navTitle: this.navTitle,
        store: store,
        fuid: store.userId,
        tuanFlag: tuanFlag || null
      })
    }).catch(err => {
      console.error(err)
    })
  },
  // getGroupStoreById(userId) {
  //   wxRepuest.getGoodsGroupStore({
  //     userId: userId || '',
  //   }).then(res => {
  //     if (res.data.data.logo) {
  //       res.data.data.logo = res.data.data.logo.startsWith('http') ? res.data.data.logo : this.data.ossUrl + res.data.data.logo;
  //     }
  //     this.name = res.data.data.name;
  //     this.navTitle = `${res.data.data.name}的团购小店`
  //     this.setData({
  //       navTitle: this.navTitle
  //     })
  //     if (res.data.data.userId == wx.getStorageSync('uid')) {
  //       wx.setStorageSync('myGroupStore', res.data.data);
  //     } else if (res.data.data.storeId != res.data.data.userId) {
  //       app.globalData.groupStoreInfo = res.data.data;
  //     } else {
  //       app.globalData.groupStoreInfo = null;
  //     }

  //   }).catch(err => {
  //     console.error(err)
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.hideShareMenu()
    this.pageLoad = true;
    CommonService.checkLoadFinsh(() => {
      let fuid;
      if (options.scene && options.scene != 'undefined') { //二维码进入
        let arr = decodeURIComponent(options.scene).split(',');
        fuid = STRSHORT.Decompress(arr[0]);
      } else if (options.fuid) {
        fuid = options.fuid;
      }
      this.navTitle = `${app.globalData.AppName}的团购小店`;
      this.setData({
        fuid: fuid || '',
        navTitle: this.navTitle,
        ossUrl: app.globalData.siteinfo.imgUrl,
        modalHidden: wx.getStorageSync('authorize') || false,
        posterBtn: true
      })

      this.findStore(fuid);


      // wxRepuest.isLeader().then(res => {
      //   this.setData({
      //     tuanFlag: res.data.data.leaderJudge
      //   })
      //   if (res.data.data.leaderJudge == 1) { //不是团长
      //     wx.setStorageSync('myIsGroup', "0");
      //     this.getGroupStoreById(this.data.fuid || '')
      //   } else if (res.data.data.disabled) { //是团长 但是被禁用
      //     wx.setStorageSync('myIsGroup', "0");
      //     this.getGroupStoreById(this.data.fuid || '')
      //   } else { //是团长 
      //     wx.setStorageSync('myIsGroup', "1");
      //     this.getGroupStoreById(wx.getStorageSync('uid'))
      //   }
      // }).catch(err => {
      //   console.error(err)
      // })

      this.getHot();
      //获取商品分类
      wxRepuest.getGroupGoodsCategory(0).then((res) => {
        this.setData({
          tab: res.data.data.rows
        })
        this.categoryId = res.data.data.rows[0].id;
        this.getGoodsList();
      })
      //首页文字
      wxRepuest.getIndexTxt().then((res) => {
        this.setData({
          broadcastList: res.data.data
        })
      })
    })
  },

  //选项卡
  chooseTab(e) {

    let idx = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;

    if (id != this.categoryId) {
      this.setData({
        tabNum: idx
      })
      this.categoryId = id;
      this.page = 1;
      this.page_totle = null;
      this.data.goodsContent = null;
      this.setData({
        isLast: false
      })
      this.getGoodsList();
    }

  },

  //获取商品列表
  page: 1,
  page_totle: null,
  getGoodsList() {
    if (this.page_totle && this.page_totle < this.page) {
      this.setData({
        isLast: true
      })
      return;
    }
    wxRepuest.getGoodsListGroup({
      categoryId: this.categoryId,
      page: this.page,
      pageSize: 10,
      isGroupStoreItem: true
    }).then(res => { //获取商品
      wx.hideLoading();
      this.page_totle == null && (this.data.goodsContent = null); //切换种类后要清空商品列表
      this.data.goodsContent && (this.data.goodsContent = this.data.goodsContent.concat(res.data.data.rows));
      this.setData({
        goodsContent: this.data.goodsContent || res.data.data.rows,
      })
      this.page_totle || (this.page_totle = Math.ceil(res.data.data.rowCount / 10));
      this.page++;
    }).catch(err => {
      wx.hideLoading();
      console.error(err)
    })
  },

  // 热销团购商品
  getHot() {
    const self = this
    wxRepuest.getHotGroup(self.data.fuid).then(res => {
      let result = []
      if (res.data.data.rows != null) {
        for (let i = 0; i < res.data.data.rows.length; i += 6) {
          result.push(res.data.data.rows.slice(i, i + 6))
        }
        self.setData({
          goods: result
        })
      }
      // let result = res.data.data.rows.slice(0, 5)
      // self.setData({
      //   goods: result
      // })
    }).catch(err => {

    })
  },


  //去详情页
  goDetail(e) {
    let itemId = e.currentTarget.dataset.itemid
    let skuId = e.currentTarget.dataset.skuid
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsId=' + itemId + '&skuId=' + skuId + '&eventType=' + 3 + '&fuid=' + this.data.fuid,
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
    if (!this.pageLoad) {
      if (app.globalData.official) { //官方进入
        this.findStore('');
        app.globalData.official = null;
      }
    } else {
      this.pageLoad = null;
    }
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
    this.getGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    let fuid = this.data.store.userId;
    if (e.from == 'button') {
      if (this.shareGoodsStatus) { //商品分享 
        return {
          title: this.data.shareGoods.name,
          imageUrl: this.data.ossUrl + this.data.shareGoods.thumbnail,
          path: `/pages/goodsDetail/goodsDetail?fuid=${fuid}&skuId=${this.data.shareGoods.skuId}&eventType=3`
        }
      } else { //分享团购店铺
        let shareGroup = JSON.parse(wx.getStorageSync('shareInfo').shareGroup);
        let title;
        shareGroup.group && (title = Service.convertText(shareGroup.group.posterTitle, this.name));
        return {
          title: title || this.navTitle,
          imageUrl: this.data.ossUrl + ((shareGroup.group && shareGroup.group.indexPoster) || wx.getStorageSync('shareInfo').sharePic),
          path: `/pages/tg_store/tg_store?fuid=${fuid}&type=group`
        }
      }
    }
    let shareGroup = JSON.parse(wx.getStorageSync('shareInfo').shareGroup);
    let title;
    shareGroup.group && (title = Service.convertText(shareGroup.group.posterTitle, this.name));
    return {
      title: title || this.navTitle,
      imageUrl: this.data.ossUrl + ((shareGroup.group && shareGroup.group.indexPoster) || wx.getStorageSync('shareInfo').sharePic),
      path: `/pages/tg_store/tg_store?fuid=${fuid}&type=group`
    }
  },
  //分享相关
  onPageScroll: function(res) {
    if (res.scrollTop > 400) {
      if (!this.data.footShare) {
        this.data.footShare = true;
        this.setData({
          footShare: this.data.footShare
        })
      }
    } else {
      if (this.data.footShare) {
        this.data.footShare = false;
        this.setData({
          footShare: this.data.footShare
        })
      }
    }
  },
  //分享 包括右下角的分享 与 分享赚
  shareTap(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (e.currentTarget.dataset.share == 'share') { //推荐商品的分享
        let data = this.data.goodsContent;
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
  shareTap1() {
    this.setData({
      shareBarShow: true
    });
  },
  closePoster(e) {
    this.setData({
      shareBarShow: false
    })
    this.shareGoodsStatus = null;
  }
})