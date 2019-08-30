// pages/my_store/my_store.js
import CommonService from '../../utils/common.js';
import Service from '../../utils/service.js';
import wxRepuest from '../../utils/wxrq.js';
let STRSHORT = require('../../utils/strShort.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    categoryIdx: 0,
    swiperTopauto: true,
    modalHidden: true,
    lvConfig: {},
    return_icon: 'http://ws3.sinaimg.cn/large/005BYqpgly1g050kzszk2j305k05kjr5.jpg',
    backgroundImg: 'http://img.chuangxiaozhu.com/wxapp/myTeam/userStoreBackgroud0.png',
    isStore: 0, //是否有店
    // 首页
    shortName: null,
    AppName: null,
    //  网络请求数据begin
    ossUrl: '',
    indexData: {
      bannerImgs: [], // 首页轮播广告图片
      goodsCategory: [], // 商品分类的6个项
      broadcastList: [], // 滚动条广播信息
      xzEarn: [], //  小主收益 广播 轮播
      timeDoubleEarn: [], // 限时翻倍赚钱  (缩略图文件路径 thumbnail)
      xzShareEarn: [], //  小主赚翻天
      storeGift: [], // 入店礼包
      sellingTopList: [], //销量排行
      recommendGoodsList: [] // 首页最下面的商品列表
    },
    //  网络请求数据end
    xzIntroduce: {},
    classroom: {},
    currentDay: new Date().getDate(),
    signStatus: true, // 签到状态  true:已签到， false:未签到
    showPopStatus: false, // 是否show弹窗  false 不弹窗
    tuanShow: true, // 团购选择
    moneyShow: false, // 代金券是否显示
    firstTuan: false, // 第一次恭喜团长弹框 3
    updateStateId: '', // 团长状态id
    pageNum: '1', //页数
    eventType: '', //eventType
    ossUrl: "",
    newMan: null,
    menuCount: 0,
    storeList: [], // 店铺街列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.hideShareMenu();
    this.pageLoad = true;
    CommonService.checkLoadFinsh(() => {
      if (options.scene && options.scene != 'undefined') {
        let scene = decodeURIComponent(options.scene);
        let arr = scene.split(',');
        let fuid = STRSHORT.Decompress(arr[0]);
        (fuid.length >= 19 && /\d{19}/.test(fuid)) && (options.fuid = STRSHORT.Decompress(arr[0]));
      }
      this.setData({
        lvConfig: app.globalData.lvConfig,
        shortName: app.globalData.shortName,
        AppName: app.globalData.AppName,
        ossUrl: app.globalData.siteinfo.imgUrl,
        posterBtn: true,
        userid: options.fuid || '',
        groupImgUrl: app.globalData.siteinfo.imgUrl + wx.getStorageSync('shareInfo').groupImg,
      })
      this.checkStore();
    })
  },
  // 店铺街
  getStreet(type, userId) {
    wxRepuest.getStoreStreetList({
      type,
      userId
    }).then(res => {
      this.setData({
        storeList: res.data.data || []
      })
    }).catch(e => {
      this.setData({
        storeList: []
      })
    })
  },
  //加载数据
  loadData() {
    let self = this;
    this.getStreet(0, this.ownerId);
    //获取商品分类 
    wxRepuest.getGoodsCategory({
      parentId: 0,
    }).then((res) => {
      this.setData({
        menuCount: res.data.data.rowCount
      })
      let result = [];
      if (res.data.data.rowCount < 6) {
        self.setData({
          'indexData.goodsCategory': [res.data.data.rows]
        });
      } else {
        //  菜单超过6个的时候begin
        if (res.data.data.rows != null) {
          for (let i = 0; i < res.data.data.rows.length; i += 6) {
            result.push(res.data.data.rows.slice(i, i + 6));
          }
          self.setData({
            'indexData.goodsCategory': result,
            categoryIdx: 0
          });
        }
        //  菜单超过6个的时候end
      }
    })
    // 小主收益循环滚动数据
    wxRepuest.getEelectIncomeSort().then(res => {
      this.setData({
        selectIncomeSort: res.data.data
      })
    }).catch(err => {
      console.error(err)
    })
    // 创小主头条数据
    wxRepuest.getHeadNews().then(res => {
      this.setData({
        headNews: res.data.data || []
      })
    })

    //获取推荐商品
    wxRepuest.getRecommendedGoods({
      page: 1,
      pageSize: 5,
      isRecommend: 1,
      ownerId: this.ownerId,
      isPlatform: true
    }).then((res) => {
      self.setData({
        'indexData.recommendGoodsList': res.data.data.rows
      })
    })

    //获取首页banner
    wxRepuest.getIndexBanner({
      advId: '1100',
      ownerId: this.ownerId
    }).then((res) => {
      self.setData({
        'indexData.bannerImgs': res.data.data.rows
      })
    })
    //新人礼包
    wxRepuest.getIndexBanner({
      advId: '1150',
      ownerId: this.ownerId
    }).then((res) => {
      if (res.data.data.rows != null) {
        self.setData({
          newMan: res.data.data.rows[0].imgUrl
        })
      }
    })
    //小主介绍
    wxRepuest.getIndexBanner({
      advId: '1200'
    }).then((res) => {
      self.setData({
        xzIntroduce: (res.data.data.rows && res.data.data.rows[0]) || ''
      })
    })

    //创业课堂
    wxRepuest.getIndexBanner({
      advId: '1300'
    }).then((res) => {
      self.setData({
        classroom: (res.data.data.rows && res.data.data.rows[0]) || ''
      })
    })

    //本月新品
    wxRepuest.getNewGoods({
      page: 1,
      pageSize: 100,
      isNew: 1,
      ownerId: this.ownerId,
      isPlatform: true
    }).then((res) => {
      if (res.data.data.rows && res.data.data.rows.length) {
        let result = []
        for (let i = 0; i < res.data.data.rows.length; i += 3) {
          result.push(res.data.data.rows.slice(i, i + 3))
        }
        self.setData({
          arr: result
        })
      }
    })

    //销量排行
    wxRepuest.getHotGoods({
      page: 1,
      pageSize: 100,
      isHot: 1,
      ownerId: this.ownerId,
      isPlatform: true
    }).then((res) => {
      if (res.data.data.rows && res.data.data.rows.length) {
        let result = [];
        for (let i = 0; i < res.data.data.rows.length; i += 3) {
          result.push(res.data.data.rows.slice(i, i + 3))
        }
        self.setData({
          'indexData.sellingTopList': result
        })
      }
    })
    //首页文字
    wxRepuest.getIndexTxt().then((res) => {
      self.setData({
        'indexData.broadcastList': res.data.data
      })
    });
    //活动接口
    wxRepuest.getActivityList({
      type: 5
    }).then((res) => {
      if (res.data.data.rows != null) {
        self.setData({
          eventType: res.data.data.rows[0].type
        })
        //获取入店礼包具体商品
        let eventId = res.data.data.rows[0].id
        wxRepuest.getActivityDetail({
          eventId: eventId,
          ownerId: this.ownerId
        }).then((res) => {
          let result = []
          for (let i = 0; i < res.data.data.rows.length; i += 3) {
            result.push(res.data.data.rows.slice(i, i + 3))
          }
          self.setData({
            'indexData.storeGift': result
          })
        })
      }
    })
  },


  //介绍
  goIntroduce() {
    const self = this
    if (self.data.xzIntroduce.linkType) {
      let type = self.data.xzIntroduce.linkType
      switch (type) {
        case 1:
          //文章
          wx.navigateTo({
            url: '/pages/xz_single/xz_single?articleId=' + self.data.xzIntroduce.articleId,
          })
          return
        case 2:
          //商品
          wx.navigateTo({
            url: '/pages/goodsDetail/goodsDetail?goodsId=' + (self.data.xzIntroduce.itemId || 1) + '&skuId=' + self.data.xzIntroduce.skuId + '&fuid=' + self.data.userid,
          })
          return
        case 3:
          //活动
          if (self.data.xzIntroduce.eventId == 5) {
            wx.navigateTo({
              url: `/pages/power_2/power_2?a=${1}&fuid=${self.data.userid}`,
            })
          } else if (self.data.xzIntroduce.eventId == 6) {
            wx.navigateTo({
              url: `/pages/free_gift2/free_gift2?eventId=${self.data.xzIntroduce.eventId}&fuid=${self.data.userid}`,
            })
          }
          return
      }
    }
  },

  //轮播图
  goSwiper(e) {
    const self = this
    let Index = e.currentTarget.dataset.index
    let name = e.currentTarget.dataset.name
    let bannerArr = self.data.indexData.bannerImgs
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
            url: '/pages/goodsDetail/goodsDetail?goodsId=' + (bannerArr[Index].id || 1) + '&skuId=' + bannerArr[Index].skuId + '&fuid=' + self.data.userid,
          })
          return
        case 3:
          //活动
          wxRepuest.getActivityListOther(bannerArr[Index].eventId).then((res) => {
            let eventType = res.data.data.rows[0].type
            if (eventType == 5) {
              wx.navigateTo({
                url: '/pages/power_2/power_2?a=' + 1 + '&eventId=' + bannerArr[Index].eventId + '&fuid=' + self.data.userid,
              })
            } else if (eventType == 6) {
              wx.navigateTo({
                url: '/pages/free_gift2/free_gift2?eventId=' + bannerArr[Index].eventId + '&fuid=' + self.data.userid,
              })
            }
          })

          return
      }
    }
  },

  // //课堂
  goClassroom() {
    const self = this
    if (self.data.classroom.linkType) {
      let type = self.data.classroom.linkType
      switch (type) {
        case 1:
          //文章
          wx.navigateTo({
            url: '/pages/xz_single/xz_single?articleId=' + self.data.classroom.articleId,
          })
          return
        case 2:
          //商品
          wx.navigateTo({
            url: `/pages/goodsDetail/goodsDetail?goodsId=${(self.data.classroom.itemId || 1)}&skuId=${self.data.classroom.skuId}&fuid=${self.data.userid}`,
          })
          return
        case 3:
          //活动
          if (self.data.classroom.eventId == 5) {
            wx.navigateTo({
              url: `/pages/power_2/power_2?a=1&fuid=${self.data.userid}`,
            })
          } else if (self.data.classroom.eventId == 6) {
            wx.navigateTo({
              url: `/pages/free_gift2/free_gift2?eventId=${self.data.classroom.eventId}&fuid=${self.data.userid}`,
            })
          }
          return
      }
    }
  },


  // 签到
  goSign: function() {
    // this.setData({
    //   signStatus: false
    // })
    wx.showToast({
      title: '敬请期待',
      icon: 'none'
    })
  },
  // 团购选择
  tuanBuy() {
    let that = this
    wxRepuest.isLeader().then((res) => {
      //  1 (不是团长)2(是团长不是第一次进入)3是团长第一次进入
      let status = res.data.data.leaderJudge
      if (status == 1) {
        this.setData({
          tuanShow: false
        })
      } else if (status == 2) {
        res.data.data.disabled ? wx.setStorageSync('myIsGroup', "0") : wx.setStorageSync('myIsGroup', "1"); //团长被禁用  
        wx.navigateTo({
          url: `/pages/tg_store/tg_store?status=${status}&fuid=${that.data.userid}`,
        })
      } else if (status == 3) {
        that.setData({
          showPopStatus: true,
          firstTuan: true
        })
        wx.setStorageSync('myIsGroup', "1");
      }
    })
  },

  // 团购操作
  tuanSelect(e) {
    let btnId = e.target.dataset.btn;
    switch (btnId) {
      case '0':
        this.setData({
          tuanShow: true
        });
        break;
      case '1':
        wx.navigateTo({
          url: '/pages/apply_form/apply_form',
        });
        break;
      case '2':
        wx.navigateTo({
          url: `/pages/tg_store/tg_store?fuid=${this.data.userid}`,
        });
        break;
    }
  },
  tuanApply() {
    wx.navigateTo({
      url: '/pages/apply_regimental/apply_regimental',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  checkStore() {
    //优先查userid的店铺，其次是token,再次是token上级，最后是平台
    wxRepuest.findStore({
      userId: this.data.userid || '',
      type: 1 // 1普通小店 2团购小店'
    }).then(res => {
      let store = res.data.data;
      if (store.userId == this.data.userid && store.userId != wx.getStorageSync('uid')) { //userid的店铺
      } else if (store.userId == wx.getStorageSync('uid')) { //我自己的店铺
        wx.setStorageSync('myIsStore', '1');
        wx.setStorageSync('myStore', store);
      } else if (store.userId == store.userStoreId) { //查到了平台
        wx.setStorageSync('myIsStore', '0');
        this.setData({
          isStore: 2
        })
        return;
      } else { //查到了上级
        wx.setStorageSync('myIsStore', '0');
      }

      store.logo && (store.logo = store.logo.startsWith('http') ? store.logo : (this.data.ossUrl + store.logo)); //店铺头像
      store.url && (store.url = store.url.startsWith('http') ? store.url : (this.data.ossUrl + store.url));
      this.ownerId = store.userId;
      this.setData({
        isStore: 1,
        store: store,
        nickName: app.globalData.userInfo ? app.globalData.userInfo.nickName : '',
        avatar: app.globalData.userInfo ? app.globalData.userInfo.avatarUrl : '',
        modalHidden: wx.getStorageSync('authorize') || false,
        userid: store.userId
      })

      this.pageNum = 1;
      this.setData({
        isLast: false
      })
      this.pageLoad = false;
      console.log('加载数据')
      this.loadData();
    }).catch(e => {
      this.setData({
        isStore: 2
      })
      console.error(e)
    })

  },
  userInfoSuc() {
    this.setData({
      modalHidden: true
    })
  },
  onTabItemTap(e) {
    if (!this.pageLoad) { //页面不是首次加载
      this.setData({
        userid: ''
      })
      this.checkStore();
      app.globalData.official && (app.globalData.official = null);
    } else { //页面是首次加载
      this.pageLoad = false;
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (!this.pageLoad && app.globalData.official) {
      this.setData({
        userid: ''
      })
      this.checkStore();
    }
    app.globalData.official = null;

    wx.getSetting({ //检查相册授权情况  onshow 触发
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
    if (!this.pullTime || (this.pullTime && Date.now() - this.pullTime >= 3000)) {
      this.pullTime = Date.now();
      this.checkStore();
    }
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  pageNum: 1, //页数
  onReachBottom() {
    if (this.data.isLast) return;
    const self = this;
    this.pageNum++;
    //获取推荐商品
    wxRepuest.getRecommendedGoods({
      page: this.pageNum,
      pageSize: 5,
      isRecommend: 1,
      ownerId: this.ownerId,
      isPlatform: true
    }).then((res) => {
      if (res.data.data.rows == null) {
        self.setData({
          isLast: true
        })
        this.pageNum--;
      } else {
        let recommendGoodsList = self.data.indexData.recommendGoodsList
        let newRecommendGoodsList = recommendGoodsList.concat(res.data.data.rows)
        self.setData({
          'indexData.recommendGoodsList': newRecommendGoodsList
        })
      }
    }).catch(err => {
      console.error(err);
      this.pageNum--;
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    if (e.from == 'button' && this.shareGoodsStatus) { //推荐商品分享 
      return {
        title: this.data.shareGoods.name,
        imageUrl: this.data.ossUrl + this.data.shareGoods.thumbnail,
        path: `/pages/goodsDetail/goodsDetail?fuid=${this.ownerId}&skuId=${this.data.shareGoods.skuId}&eventType=1`
      }
    }

    let shareInfo = wx.getStorageSync('shareInfo');
    let title = Service.convertText(shareInfo.shareTitle, this.data.store.name);
    return {
      title: title,
      imageUrl: shareInfo.sharePic ? (this.data.ossUrl + shareInfo.sharePic) : "",
      path: `/pages/my_store/my_store?fuid=${this.data.store.userId}`
    }
  },

  onPageScroll: function(res) {
    if (res.scrollTop > 600) {
      this.setData({
        footShare: true
      })
    } else {
      this.setData({
        footShare: false
      })
    }
  },
  //分享 包括右下角的分享 与 分享赚
  shareTap(e) {
    if (e.currentTarget.dataset.share == 'share') { //推荐商品的分享
      let data = this.data.indexData.recommendGoodsList;
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
  //推荐商品 跳转 及分享
  goGoodsDetail(e) {
    let type = e.target.dataset.share;
    if (type == 'share') return;
    let id = e.currentTarget.dataset.id;
    let skuId = e.currentTarget.dataset.skuid;
    wx.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?goodsId=${id}&skuId=${skuId}&eventType=1&fuid=${this.data.userid}`,
    })
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
  },

  // 去创小主头条详情
  goDetail(data) {
    let title = data.currentTarget.dataset.title
    let body = data.currentTarget.dataset.body
    wx.navigateTo({
      url: `/pages/headnewsDetail/headnewsDetail?title=${title}&body=${encodeURIComponent(body)}`
    })
  },


})