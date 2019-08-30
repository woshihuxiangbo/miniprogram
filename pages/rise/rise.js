// pages/rise/rise.js
import wxRepuest from '../../utils/wxrq.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lvConfig:{},
    shortName: '',
    AppName: '',
    statement: [],

    example: {
      info: ['小主升级示例', '小主名字：岳颖', '小主年龄：33岁', '小主职业：美妆柜台导购'],
      title: '小主晋升过程：',
      content:[],
    },
    advantage:[]

  },

  onLoad: function(options) {
    this.getRise(options.id)
    wx.setNavigationBarTitle({
      title: `${app.globalData.shortName}进阶`,
    })
    let lvConfig = app.globalData.lvConfig;
    this.setData({
      lvConfig: lvConfig,
      shortName: app.globalData.shortName,
      AppName: app.globalData.AppName,

      statement: [
        { //身份说明
          title: '纯消费用户（会员散客）：',
          txt: [{
            title: '①门槛条件：',
            txt: ['无']
          }, {
            title: '②拿货折扣：',
            txt: ['无']
          }, {
            title: '③会员收益：',
            txt: ['无']
          }],
          tips: '☆购买“创小主”399元入店礼包，即享平台店铺永久经营权，尊享“创小主”精美礼包。确认收到身份变更信息后，表示你已成为创小主店主，立即销售，即可赚佣。'
        }, {
          title: `${lvConfig.lv1.name}身份：`,
          txt: [{
            title: '①门槛条件：',
            txt: ['399元']
          }, {
            title: '②拿货折扣：',
            txt: ['8折']
          }, {
            title: `③${lvConfig.lv1.name}收益：`,
            txt: [`A.${lvConfig.lv1.name}每邀请一位新${lvConfig.lv1.name}，还可额外享受20%收益，无上限累加', 'B.${lvConfig.lv1.name}A邀请${lvConfig.lv1.name}B无收益（${lvConfig.lv1.name}只拿直招1级收益）', 'C.升级${lvConfig.lv3.name}或总监，直招代理直接划分升级${lvConfig.lv1.name}名下`]
          }],
          tips: `☆购买“创小主”399元入店礼包，即享平台店铺永久经营权，尊享“创小主”精美礼包。确认收到身份变更信息后，表示你已成为创小主${lvConfig.lv1.name}，立即销售，即可赚佣。`
        }, {
          title: `${lvConfig.lv2.name}身份：`,
          txt: [{
            title: '①门槛条件：',
            txt: ['3000元']
          }, {
            title: '②拿货折扣：',
            txt: ['6.5折']
          }, {
            title: `③${lvConfig.lv2.name}收益：`,
            txt: [`A.${lvConfig.lv2.name}直招${lvConfig.lv1.name}享35%收益', 'B.${lvConfig.lv2.name}享下设${lvConfig.lv1.name}招致所有${lvConfig.lv1.name}15%收益', 'C.直招${lvConfig.lv2.name}B享受B团队业绩6%（由上级${lvConfig.lv3.name}提供））`]
          }],
          tips: `☆充值3000元即享${lvConfig.lv2.name}身份，享受超低拿货折扣，另有丰厚利润赚取。享受一年无忧退款机制，投资零风险、抢机遇、不后悔。`
        }, {
          title: `${lvConfig.lv3.name}身份：`,
          txt: [{
            title: '①门槛条件：',
            txt: ['3万元']
          }, {
            title: '②拿货折扣：',
            txt: ['5折']
          }, {
            title: `③${lvConfig.lv3.name}收益：`,
            txt: [`A.${lvConfig.lv3.name}直招${lvConfig.lv`3`.name}额外加享50%收益', 'B.${lvConfig.lv3.name}享下设${lvConfig.lv1.name}招致所有新${lvConfig.lv1.name}的30%收益', 'C.${lvConfig.lv3.name}直招${lvConfig.lv2.name}加享15%收益', 'D.${lvConfig.lv3.name}享下设${lvConfig.lv2.name}招致所有新${lvConfig.lv2.name}9%收益', 'E.直招${lvConfig.lv3.name}A享受${lvConfig.lv3.name}A团队业绩的4%（公司返佣）`]
          }],
          tips: `☆特别推出${lvConfig.lv3.name}“cp制”扶持计划帮各位小主一站式解决运营背后所有问题。公司为${lvConfig.lv3.name}配备高级助理，提供高达3000粉丝且持续增粉的业务手机。助理全权招意向代理，${lvConfig.lv3.name}只需管理、统筹，利润仅仅三七开。`
        }],
      riseWay: [{
        start: '399元',
        end: `${lvConfig.lv1.name}`,
        endTips: '(永久)'
      }, {
        start: '3000元',
        end: `${lvConfig.lv2.name}`,
        endTips: '(永久)'
      }, {
        start: '3万元',
        end: `${lvConfig.lv3.name}`,
        endTips: '(永久)'
      }
      ],
      content: [`2018年5月，岳颖经朋友介绍接触到“创小主”APP，购买了一支眼部精华，经过一段时间产品使用后，觉得原本眼角细纹得到了改善。', '岳颖用图文的方式记录了使用过程分享到了朋友圈，引起了不少好友的评论。在了解了创小主的赚钱模式之后，岳颖决定先试着购买399元入店礼包，获得了创小主店铺永久的经营权和一套护肤品。', '不到一个月的时间，岳颖经过自己的努力，很快有十几个姐妹愿意一起加入创小主，成为创小主的一员。此时岳颖的额外收入在每月800元左右。', '尝到甜头的岳颖毫不犹豫的充值了3000元获得了${lvConfig.lv2.name}身份，享受到了更低折扣的拿货价格，并且成立了自己团队社群。这时岳颖的额外收入又增加到每月5000元左右。', '为了更好经营这份事业，岳颖辞去了原本每个月6000元的美妆柜台导购，直接充值3万元成为了${lvConfig.lv3.name}身份。', '2018年10月岳颖已经建立了自己的沙龙，参与公司嘉宾分享，接受系统化的专业讲师培训，成为了一名优秀的创小主商学院特聘讲师。这时岳颖的月收入已经达到每月2万元左右。', '2019年1月岳颖成功打造了自己明星流量IP，手下团队达到数千个，并解锁了“区域${lvConfig.lv3.name}”升级模式，拿下整个区域的分红。`],

      advantage: [`① 享更低拿货折扣，赚更多丰厚利润；', '② 享更高直招收益，收更多返佣分红；', '③ 创${lvConfig.lv3.name}“cp制”，一站解决所有问题；', '④ 赚更多人脉资源，与大咖共塑更好自我；', '⑤ 享完善配套服务，更多奖励机制保障；', '⑥ 打造个人明星流量IP，跃升行业佼佼者。`]
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  getRise(id){
    wxRepuest.getArticleList(id).then(res=>{

    })
  }
 
})