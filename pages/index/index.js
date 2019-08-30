//index.js
//获取应用实例
import CommonService from '../../utils/common.js';
import Service from '../../utils/service.js';
import wxRepuest from '../../utils/wxrq.js';

const app = getApp();
Page({
  data: {
    swiperTopauto: true,
    modalHidden: true,
    shortName: '',
    AppName: '',
    //  网络请求数据begin
    ossUrl: '',
    indexData: {
      bannerImgs: [], // 首页轮播广告图片
      goodsCategory: [], // 商品分类的6个项
      broadcastList: [], // 滚动条广播信息
      xzEarn: [],
      timeDoubleEarn: [], // 限时翻倍赚钱  (缩略图文件路径 thumbnail)
      xzShareEarn: [], //  小主赚翻天
      storeGift: [], // 入店礼包
      sellingTopList: [], //销量排行
      recommendGoodsList: [] // 首页最下面的商品列表
    },
    //  网络请求数据end
    xzIntroduce: null,
    classroom: null,
    currentDay: new Date().getDate(),
    signStatus: true, // 签到状态  true:已签到， false:未签到

    showPopStatus: false, // 是否show弹窗  false 不弹窗
    tuanShow: true, // 团购选择
    moneyShow: false, // 代金券是否显示
    firstTuan: false, // 第一次恭喜团长弹框 3
    // updateStateId: '', // 团长状态id
    // warn: null,
    // eventType: '',
    // couponId: '', // 代金券ID
    amount: 0, // 代金券金额
    newMan: null,
    lvConfig: {},
    menuCount: 0, // 商品菜单数量
    headNews: [], // 头条列表
  },
  eventType: '',
  updateStateId: '', // 团长状态id
  warn: null,
  couponId: '', // 代金券ID
  onLoad: function(options) {
    // wx.hideShareMenu();
    CommonService.checkLoadFinsh(() => {
      //页面逻辑从这里开始写
      this.setData({
        groupImgUrl: app.globalData.siteinfo.imgUrl + wx.getStorageSync('shareInfo').groupImg,
        ossUrl: app.globalData.siteinfo.imgUrl,
        logo: app.globalData.storeLogo,
        modalHidden: wx.getStorageSync('authorize') || false,
        posterBtn: true
      });
      if (app.configInit) {
        this.setData({
          lvConfig: app.globalData.lvConfig,
          shortName: app.globalData.shortName,
          AppName: app.globalData.AppName
        });
      } else {
        app.configCb = () => {
          this.setData({
            lvConfig: app.globalData.lvConfig,
            shortName: app.globalData.shortName,
            AppName: app.globalData.AppName
          });
        };
      }

      this.getData();
      // 恭喜成为小主团长弹框
      this.isTuan();
      this.isVoucher();
    });
  },
  userInfoSuc() {
    this.setData({
      modalHidden: true
    })
  },
  //加载数据
  getData() {
    const self = this;
    // 菜单分类
    wxRepuest.getGoodsCategory({
      parentId: 0
    }).then((res) => {
      this.setData({
        menuCount: res.data.data.rowCount
      })
      let result = [];
      if (res.data.data.rowCount < 6) {
        console.log('菜单小于6个')
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
            'indexData.goodsCategory': result
          });
        }
      }
    });

    //获取首页banner
    wxRepuest.getIndexBanner({
      advId: '1100'
    }).then((res) => {
      self.setData({
        'indexData.bannerImgs': res.data.data.rows
      });
    });

    setTimeout(() => {
      // 创小主头条数据
      wxRepuest.getHeadNews().then(res => {
        this.setData({
          headNews: res.data.data || []
        })
      })
      // 小主收益循环滚动数据
      wxRepuest.getEelectIncomeSort().then(res => {
        this.setData({
          selectIncomeSort: res.data.data
        })
      }).catch(err => {
        console.error(err)
      })

      //获取推荐商品
      wxRepuest.getRecommendedGoods({
        page: 1,
        pageSize: 5,
        isRecommend: 1
      }).then((res) => {
        self.setData({
          'indexData.recommendGoodsList': res.data.data.rows
        });
      });
      //小主介绍
      wxRepuest.getIndexBanner({
        advId: '1200'
      }).then((res) => {
        if (res.data.data.rows) {
          self.setData({
            xzIntroduce: res.data.data.rows[0]
          });
        } else {
          self.setData({
            xzIntroduce: res.data.data.rows
          });
        }
      });

      //创业课堂
      wxRepuest.getIndexBanner({
        advId: '1300'
      }).then((res) => {
        if (res.data.data.rows) {
          self.setData({
            classroom: res.data.data.rows[0]
          });
        } else {
          self.setData({
            classroom: res.data.data.rows
          });
        }
      });
      //新人礼包
      wxRepuest.getIndexBanner({
        advId: '1150'
      }).then((res) => {
        if (res.data.data.rows != null) {
          self.setData({
            newMan: res.data.data.rows[0].imgUrl
          });
        }
      });
      //本月新品
      wxRepuest.getNewGoods({
        page: 1,
        pageSize: 100,
        isNew: 1
      }).then((res) => {
        let result = [];
        for (let i = 0; i < res.data.data.rows.length; i += 3) {
          result.push(res.data.data.rows.slice(i, i + 3));
        }
        self.setData({
          arr: result
        });
      });

      //热销商品
      wxRepuest.getHotGoods({
        page: 1,
        pageSize: 100,
        isHot: 1
      }).then((res) => {
        let result = [];
        for (let i = 0; i < res.data.data.rows.length; i += 3) {
          result.push(res.data.data.rows.slice(i, i + 3));
        }
        self.setData({
          'indexData.sellingTopList': result
        });
      });

      //首页文字
      this.getBradcastList(10);
      //活动接口
      wxRepuest.getActivityList({
        type: 5
      }).then((res) => {
        if (res.data.data.rows != null) {
          // self.setData({
          //   eventType: res.data.data.rows[0].type
          // })
          this.eventType = res.data.data.rows[0].type;
          //获取入店礼包具体商品
          let eventId = res.data.data.rows[0].id;
          wxRepuest.getActivityDetail({
            eventId: eventId
          }).then((res) => {
            let result = [];
            if (res.data.data.rows) {
              for (let i = 0; i < res.data.data.rows.length; i += 3) {
                result.push(res.data.data.rows.slice(i, i + 3));
              }
              self.setData({
                'indexData.storeGift': result
              });
            }

          });
        }
      });
    }, 1000);
  },
  //首页文字
  getBradcastList(count) {
    wxRepuest.getIndexTxt({
      count: count
    }).then((res) => {
      this.setData({
        'indexData.broadcastList': this.data.indexData.broadcastList.concat(res.data.data)
      });
      if (this.hornFist) {
        this.setData({
          hornIdx: 10
        })
      }
    });
  },
  broadcastChange(e) {
    if (e.detail.current == 9 && !this.hornFist) {
      this.hornFist = true;
      this.getBradcastList(100)
    }
  },
  //  首页代金券弹框
  isVoucher() {
    let that = this;
    wxRepuest.isVoucher().then(res => {
      let couponId = res.data.data.couponId;
      let state = res.data.data.state; //  false 不弹窗
      let amount = res.data.data.amount / 100;
      this.couponId = couponId || '';
      that.setData({
        // couponId: couponId || '',
        amount: amount,
        showPopStatus: state,
        moneyShow: state
      });
    }).catch(err => {

    });
  },
  getVoucher() { // 点击领取代金券
    let that = this;
    wxRepuest.getVoucher({
      // couponId: this.data.couponId
      couponId: this.couponId
    }).then(res => {
      let showPopStatus = that.data.firstTuan ? true : false; // 领券弹窗盖在恭喜弹框之上，若有弹出（恭喜），则不关闭遮罩
      wx.showToast({
        title: '成功领取',
        duration: 2000
      });
      that.setData({
        moneyShow: false,
        showPopStatus: showPopStatus
      });
    });
  },

  //介绍
  goIntroduce() {
    const self = this;
    if (self.data.xzIntroduce.linkType) {
      let type = self.data.xzIntroduce.linkType;
      switch (type) {
        case 1:
          //文章
          wx.navigateTo({
            url: '/pages/xz_single/xz_single?articleId=' + self.data.xzIntroduce.articleId
          });
          return;
        case 2:
          //商品
          wx.navigateTo({
            url: '/pages/goodsDetail/goodsDetail?goodsId=' + (self.data.xzIntroduce.itemId || 1) + '&skuId=' + self.data.xzIntroduce.skuId
          });
          return;
        case 3:
          //活动
          wxRepuest.getActivityListOther(bannerArr[Index].eventId).then((res) => {
            let eventType = res.data.data.rows[0].type;
            if (eventType == 5) {
              wx.navigateTo({
                url: '/pages/power_2/power_2?a=' + 1 + '&eventId=' + bannerArr[Index].eventId
              });
            } else if (eventType == 6) {
              wx.navigateTo({
                url: '/pages/free_gift2/free_gift2?eventId=' + bannerArr[Index].eventId
              });
            }
          });
          return;
      }
    } else {

    }
  },

  //轮播图
  goSwiper(e) {
    const self = this;
    let Index = e.currentTarget.dataset.index;
    let name = e.currentTarget.dataset.name;
    let bannerArr = self.data.indexData.bannerImgs;
    if (bannerArr[Index].linkType) {
      let type = bannerArr[Index].linkType;
      switch (type) {
        case 1:
          //文章
          wx.navigateTo({
            url: `/pages/xz_single/xz_single?articleId=${bannerArr[Index].articleId}&name=${name}`
          });
          return;
        case 2:
          //商品
          wx.navigateTo({
            url: '/pages/goodsDetail/goodsDetail?goodsId=' + (bannerArr[Index].id || 1) + '&skuId=' + bannerArr[Index].skuId
          });
          return;
        case 3:
          //活动
          wxRepuest.getActivityListOther(bannerArr[Index].eventId).then((res) => {
            let eventType = res.data.data.rows[0].type;
            if (eventType == 5) {
              wx.navigateTo({
                url: '/pages/power_2/power_2?a=' + 1 + '&eventId=' + bannerArr[Index].eventId
              });
            } else if (eventType == 6) {
              wx.navigateTo({
                url: '/pages/free_gift2/free_gift2?eventId=' + bannerArr[Index].eventId
              });
            }
          });
          return;
      }
    }
  },

  // //课堂
  goClassroom() {
    const self = this;
    if (self.data.classroom.linkType) {
      let type = self.data.classroom.linkType;
      switch (type) {
        case 1:
          //文章
          wx.navigateTo({
            url: '/pages/xz_single/xz_single?articleId=' + self.data.classroom.articleId
          });
          return;
        case 2:
          //商品
          wx.navigateTo({
            url: '/pages/goodsDetail/goodsDetail?goodsId=' + (self.data.classroom.itemId || 1) + '&skuId=' + self.data.classroom.skuId
          });
          return;
        case 3:
          //活动
          if (self.data.classroom.eventId == 5) {
            wx.navigateTo({
              url: '/pages/power_2/power_2?a=' + 1
            });
          } else if (self.data.classroom.eventId == 6) {
            wx.navigateTo({
              url: '/pages/free_gift2/free_gift2?eventId=' + self.data.classroom.eventId
            });
          }
          return;
      }
    } else {

    }
  },

  onShow() {
    if (this.leaderCheck) {
      this.isTuan();
    }
    if (!this.data.tuanShow) {
      this.setData({
        tuanShow: true
      });
    }

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
  offic(e) {},

  // 签到
  goSign: function() {

    wx.showToast({
      title: '敬请期待',
      icon: 'none',
      duration: 2000
    });
  },

  // 团购选择
  tuanBuy() {

    if (this.tu) return;
    this.tu = true;
    let that = this;
    let uid = wx.getStorageSync('uid');
    wxRepuest.isLeader().then((res) => {
      //  1 (不是团长)2(是团长不是第一次进入)3是团长第一次进入
      let status = res.data.data.leaderJudge;
      if (status == 1) {
        this.setData({
          tuanShow: false
        }, () => {
          that.tu = null;
        });
        wx.setStorageSync('myIsGroup', '0');
      } else if (status == 2) {
        res.data.data.disabled ? wx.setStorageSync('myIsGroup', '0') : wx.setStorageSync('myIsGroup', '1'); //团长被禁用
        wx.navigateTo({
          url: `/pages/tg_store/tg_store?status=${status}`,
          success: res => {
            that.tu = null;
          }
        });
      } else if (status == 3) {
        that.setData({
          showPopStatus: true,
          firstTuan: true
        }, () => {
          that.tu = null;
        });
        wx.setStorageSync('myIsGroup', '1');
      }
    });
  },
  // 进入首页判断是否恭喜团长弹窗
  isTuan() {
    let that = this;
    wxRepuest.isLeader().then((res) => {
      //  1 (不是团长)2(是团长不是第一次进入)3是团长第一次进入
      this.leaderCheck = true;
      let updateStateId = res.data.data.id;
      // that.setData({
      //   // updateStateId: updateStateId,
      //   warn: res.data.data.warn
      // })
      this.warn = res.data.data.warn;
      this.updateStateId = updateStateId;
      let leaderJudge = res.data.data.leaderJudge;
      if (leaderJudge == 3 && !res.data.data.disabled) {
        that.setData({
          showPopStatus: true,
          firstTuan: true
        });
        CommonService.checkMyStore(); //更新店铺状态
      } else {
        that.setData({
          showPopStatus: false,
          firstTuan: false
        });
      }

    });
  },


  // 关闭弹窗
  closePopTuan() {
    let that = this;
    // wxRepuest.updateStateTuan(this.data.updateStateId).then(res => {
    wxRepuest.updateStateTuan(this.updateStateId).then(res => {
      that.setData({
        firstTuan: false,
        showPopStatus: false
      });
    }).catch(err => {
      that.setData({
        firstTuan: false,
        showPopStatus: false
      });
    });
  },


  // 团购操作
  tuanSelect(e) {
    let btnId = e.target.dataset.btn;
    let uid = wx.getStorageSync('uid');
    switch (btnId) {
      case '0':
        this.setData({
          tuanShow: true
        });
        break;
      case '2':
        wx.navigateTo({
          url: '/pages/tg_store/tg_store'
        });
        break;
      case '3':
        this.setData({
          tuanShow: true
        });
        break;
    }
  },


  tuanApply() {
    // if (!this.data.warn) { // 若返回id 为空 ，则去填表
    if (!this.warn) { // 若返回id 为空 ，则去填表
      wx.navigateTo({
        url: '/pages/apply_regimental/apply_regimental'
      });
    } else {
      wx.showToast({
        title: '正在审核中,请等待',
        icon: 'none',
        duration: 2000
      });
    }

  },


  // 弹出层
  showPop: function() {
    this.setData({
      showPopStatus: false,
      moneyShow: false
    });
  },


  // 返回顶部
  onPageScroll: function(res) {
    const self = this;
    if (res.scrollTop > 600) {
      if (!this.data.footShare) {
        this.data.footShare = true;
        this.setData({
          footShare: this.data.footShare
        });
      }
    } else {
      if (this.data.footShare) {
        this.data.footShare = false;
        this.setData({
          footShare: this.data.footShare
        });
      }

    }
  },
  //  下拉刷新
  onPullDownRefresh() {
    if (!this.pullTime || (this.pullTime && Date.now() - this.pullTime >= 3000)) {
      this.pullTime = Date.now();
      this.getData();
      this.isTuan();
      this.isVoucher();
    }
    wx.stopPullDownRefresh();
  },
  /**
   * 上拉触底
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
      isRecommend: 1
    }).then((res) => {
      if (res.data.data.rows == null) {
        self.setData({
          isLast: true
        });
        this.pageNum--;
      } else {
        let recommendGoodsList = self.data.indexData.recommendGoodsList;
        let newRecommendGoodsList = recommendGoodsList.concat(res.data.data.rows);
        self.setData({
          'indexData.recommendGoodsList': newRecommendGoodsList
        });
      }
    }).catch(err => {
      console.error(err);
      this.pageNum--;
    });
  },

  onShareAppMessage(e) {
    if (e.from === 'button' && this.shareGoodsStatus) { //推荐商品分享
      let myIsStore = wx.getStorageSync('myIsStore');
      let uid = wx.getStorageSync('uid');
      let fuid = (myIsStore == '1') ? uid : (app.globalData.storeInfo ? app.globalData.userId : uid);
      return {
        title: this.data.shareGoods.name,
        imageUrl: this.data.ossUrl + this.data.shareGoods.thumbnail,
        path: `/pages/goodsDetail/goodsDetail?fuid=${fuid}&skuId=${this.data.shareGoods.skuId}&eventType=1`
      };
    }

    return Service.shareObj();
  },

  //推荐商品 跳转 及分享
  goGoodsDetail(e) {
    let type = e.target.dataset.share;
    if (type == 'share') return;
    let id = e.currentTarget.dataset.id;
    let skuId = e.currentTarget.dataset.skuid;
    wx.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?goodsId=${id}&skuId=${skuId}&eventType=1`
    });
  },
  //分享 包括右下角的分享 与 分享赚
  shareTap(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (e.currentTarget.dataset.share == 'share') { //推荐商品的分享
        let data = this.data.indexData.recommendGoodsList;
        for (let i = 0; i < data.length; i++) {
          if (data[i].skuId == e.currentTarget.dataset.skuid) {
            this.setData({
              shareGoods: data[i]
            });
            this.shareGoodsStatus = true;
            break;
          }
        }
      }
      this.setData({
        shareBarShow: true
      });
    });

  },
  shareTap1() {
    this.setData({
      shareBarShow: true
    });
  },
  savImg(e) {
    if (this.shareGoodsStatus) { //商品分享
      this.setData({
        doCvs: this.data.doCvs ? false : true
      });
    } else { //右下角分享
      this.setData({
        cvsShow: true
      });
    }
  },
  closePoster(e) {
    this.setData({
      shareBarShow: false
    });
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
  },
  // 去创小主头条详情
  goDetail(data) {
    let title = data.currentTarget.dataset.title
    let body = data.currentTarget.dataset.body
    wx.navigateTo({
      url: `/pages/headnewsDetail/headnewsDetail?title=${title}&body=${encodeURIComponent(body)}`
    })
  },
  gomy_store(e) {
    let userid = e.currentTarget.dataset.userid;
    wx.reLaunch({
      url: `/pages/my_store/my_store?fuid=${userid}`,
    })
  }

});