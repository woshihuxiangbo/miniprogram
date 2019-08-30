// pages/partner/partner.js
import wxRepuest from "../../utils/wxrq.js";
import CommonService from '../../utils/common.js';
import Service from '../../utils/service.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperTopauto: true,
    tuan: '', // 团长字符串
    lvConfig: {},
    shortName: '',
    ossUrl: '',
    xzData: {
      rank: '', // 角色
      bannerImgs: [], // 轮播图数组
      deposit: 0, // 预存金额
      commissionIncome: 0, // 佣金收益
    },
    balanceShow: false, // 是店主/店员 为true
    rankNum: '', // 等级
    cashAvailable: '', //可借现金
    cashCoupon: '', //代金卷
    prestore: '', //预存金额
    income_total: '', //收益总金额
    message: '', // 未读消息
    banner: '',
    imgUrlOne: 'http://img.koudejun.com',
    imgUrl: 'http://img.chuangxiaozhu.com/',
    // 大标题数据（例子：小主学院，小主服务）
    bigTit: {
      school: {
        icon: '',
        id: '',
        name: ''
      },
    },
    schoolClass: [], // 页面上的 4 个 分类
    orderStatus: {
      alldata: '',
      dropshipping: '',
      unevaluated: '',
      unpaid: '',
      waitforfeceiving: ''
    },
    moneyArticle: null,


    navnData: [{
      id: '1',
      icon: '/images/icons/mp.png',
      txt: '名片'
    }, {
      id: '2',
      icon: '/images/icons/tk.png',
      txt: '听课'
    }, {
      id: '3',
      icon: '/images/icons/gzt.png',
      txt: '工作台'
    }, {
      id: '4',
      icon: '/images/icons/sc.png',
      txt: '素材'
    }, {
      id: '5',
      icon: '/images/icons/rqt.png',
      txt: '入群通道'
    }, {
      id: '6',
      icon: '/images/icons/yqrz.png',
      txt: '邀请入驻'
    }]
  },
  //  获取是否是团长
  isTuan() {
    wxRepuest.findStore({
      userId: '',
      type: 2 // 1普通小店 2团购小店'
    }).then(res => {
      if (res.data.data.userId == wx.getStorageSync('uid')) {
        this.setData({
          tuan: '+团长'
        })
        wx.setStorageSync('myIsGroup', "1");
        wx.setStorageSync('myGroupStore', res.data.data);
      } else {
        this.setData({
          tuan: ''
        })
        wx.setStorageSync('myIsGroup', "0");
      }
    }).catch(err => {
      console.error(err)
    })
    // wxRepuest.isLeader().then(res => {
    //   //  1 (不是团长)2(是团长不是第一次进入)3是团长第一次进入
    //   let flag = res.data.data.leaderJudge
    //   let disabled = res.data.data.disabled
    //   if (((flag == 2 || flag == 3) && !disabled)) {
    //     this.setData({
    //       tuan: '+团长'
    //     })
    //   } else {
    //     this.setData({
    //       tuan: ''
    //     })
    //   }
    // })
  },
  //修改个人信息
  changePersonInfor: function(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (e.target.dataset.rank) return;
      wx.navigateTo({
        url: '../personInfo/personInfo',
      })
    })
  },

  onLoad() {
    this.setData({
      lvConfig: app.globalData.lvConfig,
      shortName: app.globalData.shortName,
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    this.getClass();
    this.getGjp();
    this.getMoneyArticle();
  },
  //获取banner
  // getBanner() {
  //   wxRepuest.getIndexBanner({
  //     advId: '3100'
  //   }).then((res) => {
  //     this.setData({
  //       banner: res.data.data.rows
  //     })
  //   }).catch(err=>{
  //     console.error(err)
  //   })
  // },
  // 可接金额文章接口
  getMoneyArticle() {
    wxRepuest.getIndexBanner({
      advId: '3101'
    }).then((res) => {
      if (res.data.data.rows) {
        this.setData({
          moneyArticle: res.data.data.rows[0]
        })
      }
    }).catch(err => {
      console.error(err)
    })
  },
  /**
   * 页面显示就要更新身份状态
   */
  onShow() {
    this.isTuan()
    this.getInfo()
    wxRepuest.getOrderStatistics().then((res) => {
      if (res.data.code == 200) {
        this.setData({
          'orderStatus.alldata': res.data.data.alldata,
          'orderStatus.dropshipping': res.data.data.dropshipping,
          'orderStatus.unevaluated': res.data.data.unevaluated,
          'orderStatus.unpaid': res.data.data.unpaid,
          'orderStatus.waitforfeceiving': res.data.data.waitforfeceiving
        })
      }
    }).catch(err => {})
    wx.getSetting({
      success: res => {
        let noPhotosAlbum = wx.getStorageSync('noPhotosAlbum');
        if (res.authSetting['scope.writePhotosAlbum']) { //受过权
          noPhotosAlbum && wx.removeStorageSync('noPhotosAlbum');
          this.setData({
            noPhotosAlbum: false
          });
        } else { //没受过权
          if (noPhotosAlbum) { //询问过
            this.setData({
              noPhotosAlbum: noPhotosAlbum
            });
          } else { //没询问过
            this.setData({
              noPhotosAlbum: false
            });
          }
        }
      }
    });
  },
  getInfo() {
    wxRepuest.userReationInfo().then(res => {
      this.setData({
        rankNum: res.data.data.level,
        // cashAvailable: res.data.data.cashAvailable,
        cashCoupon: res.data.data.cashCoupon,
        prestore: res.data.data.prestore / 100,
        income_total: res.data.data.income_total / 100,
        message: res.data.data.count,
        'xzData.rank': res.data.data.levelname
      })

      CommonService.checkMyStore();
    })
  },
  //获取贵就赔图标
  getGjp() {
    wxRepuest.getXzCenterGjpClass().then(res => {
      if (res.data.data.rows) {
        this.setData({
          gjp: res.data.data.rows[0]
        })
      }
    }).catch(err => {
      console.error(err)
    })
  },
  // 获取分类数据
  getClass() {
    wxRepuest.getXzCenterClass().then(res => {
      let bigTit = res.data.data.rows[0]
      if (bigTit) {
        this.setData({
          'bigTit.school': bigTit
        })
        wxRepuest.getXzCenterTwoClass(bigTit.id).then(res => {
          let schoolArr = res.data.data.rows
          if (schoolArr) {
            this.setData({
              schoolClass: schoolArr
            })
          }
        })
      }
    })
  },
  // 进入分类详细
  goClassItem(e) {
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    wxRepuest.getXzCenterTwoClass(id).then(res => {
      let num = res.data.data.rows
      if (num && num.length > 1) {
        wx.navigateTo({
          url: `/pages/school/school?id=${id}&name=${name}`,
        })
      } else {
        wx.navigateTo({
          url: `/pages/xz_single/xz_single?id=${id}&name=${name}`,
        })
      }
    })
  },

  goBanner(e) {
    const self = this
    let Index = e.currentTarget.dataset.index
    let name = e.currentTarget.dataset.name
    let bannerArr = self.data.banner
    if (bannerArr[Index].linkType) {
      let type = bannerArr[Index].linkType
      switch (type * 1) {
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
  onPullDownRefresh() {
    this.setData({
      lvConfig: app.globalData.lvConfig,
      shortName: app.globalData.shortName,
    })
    this.isTuan()
    this.getInfo()
    this.getMoneyArticle();
    wx.stopPullDownRefresh();
  },
  gonavitem(e) {
    let navid = e.currentTarget.dataset.id;
    if (e.type == "getuserinfo") {
      CommonService.getUserInfo(e.detail, res => {
        this.swichNav(navid);
      })
    } else {
      this.swichNav(navid);
    }
  },
  swichNav(navid) {
    let url, tost;
    switch (navid * 1) {
      case 1: //名片
        url = '/pages/my_card/my_card';
        break;
      case 2: //听课
        break;
      case 3: //工作台
        url = `/pages/workbench/workbench?levelname=${this.data.xzData.rank}`;
        break;
      case 4: //素材
        break;
      case 5: //入群通道
        url = `/pages/gochannel/gochannel?level=${this.data.rankNum}&name=${this.data.xzData.rank}`;
        break;
      case 6: //邀请入驻
        if (this.data.tuan) {
          this.setData({
            shareBarShow: true
          })
          return;
        } else {
          tost = '你还不是团长'
        }
    }
    if (url) {
      wx.navigateTo({
        url: url,
      })
    } else {
      wx.showToast({
        title: tost || '敬请期待',
        icon: 'none'
      })
    }
  },
  gopower(e) {
    wx.navigateTo({
      url: '/pages/power/power?a=32',
    })
  },
  gocommission_detail(e) {
    wx.navigateTo({
      url: '/pages/commission_detail/commission_detail',
    })
  },
  godeposit_detail(e) {
    wx.navigateTo({
      url: '/pages/deposit_detail/deposit_detail',
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
  onShareAppMessage(e) {
    if (e.from == "button") {
      let shareGroup = JSON.parse(wx.getStorageSync('shareInfo').shareGroup);
      let title;
     
      shareGroup.group && (title = Service.convertText(shareGroup.invite.posterTitle, app.globalData.userInfo.nickName));
      return {
        title: title,
        imageUrl: this.data.ossUrl + shareGroup.group.indexPoster,
        path: `pages/apply_regimental/apply_regimental?fuid=${wx.getStorageSync('uid')}`
      }
    } else {
      return Service.shareObj();
    }
  },
  savImg(e) {
    this.setData({
      cvsShow: true
    });
  },
  closePoster(e) {
    this.setData({
      shareBarShow: false
    });
  },

})