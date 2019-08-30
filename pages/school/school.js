// pages/school/school.js
import wxRepuest from '../../utils/wxrq.js';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIdx: 0, //切换左侧tab栏
    tab: ['小主指南', '小主攻略', '小主权益', '玩转小主'],
    rightTit:[],  // 获取右边的标题
    content: [{
      title: '1、创小主到底是做什么的？',
      txt: '创小主就是自用省钱+分享赚钱+业绩分红的APP。旨在满足“女性一站式美丽进阶”需求，完美解决了传统商、电商等平台的商业痛点，创造了新的互联网模式（S2B2C）社交新零售、新模式、新制度、新红利。创始人岳子轩是第一批微商开拓者，曾获“微商”风云人物奖，首提“分单模式”、“无忧微商”概念，创建“轩女王国际”，拥数十万微商团队，单品年均业绩达2亿。市场运作经验丰富，带领团队成功孵化梵洁诗、香蔓蕾、舒派等知名品牌。创立护肤品牌“法蓝妮卡”，获得央视商城优选品牌称号。多年微商经验，深谙分销魅力和其精髓，此商城在模式体系上也完全嫁接了微商思维，以便于实体店未来线上裂变的爆发。'
    }, {
      title: '2、创小主轻投资创业适合哪些人群？',
      txt: '看见爱上的贺卡山东济南局决定将决定'
    }, {
      title: '3、创小主的商品是否是正品？',
      txt: '看见爱上的贺卡山东济南局决定将决定'
    }, {
      title: '4、创小主在创业成本上相当于传统电商、微商有优势吗？',
      txt: '看见爱上的贺卡山东济南局决定将决定'
    }],
    currentTxt: 0, //切换文本内容的索引
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMenu(options.id)

     wx.setNavigationBarTitle({
       title: `${options.name}`,
     })
  },
  swichTab(e) {
    let idx = e.currentTarget.dataset.idx * 1;
    let id = e.currentTarget.dataset.id;
    if (idx != this.data.currentIdx) {
      this.setData({
        currentIdx: idx,
        currentTxt: 0
      })
    }
    this.getRightTit(id)
  },
  swichTxt(e) {
    let idx = e.currentTarget.dataset.idx * 1;
    this.setData({
      currentTxt: idx == this.data.currentTxt ? null : idx
    })


  },
   //  获取左侧菜单
   getMenu(id){
  
     wxRepuest.getXzCenterTwoClass(id).then(res=>{
       let menu = res.data.data.rows
       if(menu){
         this.getRightTit(res.data.data.rows[0].id)
         this.setData({ tab: menu})
       }
    }).catch(err=>{

    })
   },
   getRightTit(id){
     wxRepuest.getArticleList(id).then(res => {
       let rightTit = res.data.data.rows || []
       rightTit.forEach(function (e, i) {
         let bodyStr = e.body
         rightTit[i].body = bodyStr.replace(/<img/g, '<img style="max-width:100%;height:auto"')
       })
       if (rightTit) {
         this.setData({ rightTit: rightTit })
       }else{
         this.setData({ rightTit: [] })
       }

     }).catch(err => {

     })
   }
})