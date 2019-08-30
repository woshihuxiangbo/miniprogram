import wxRepuest from '../../utils/wxrq.js';
let app = getApp();
Page({
  data: {
    ossUrl: '',
    currentIdx: 0,
    goodsList: [], // 商品列表
    query: {
      goodsName: '',
      priceSort: 1,
      salesSort: '',
      pageNum: 1,
      pageSize: 20
    },
    listShow: false,

  },
  totalPage: null,
  onLoad(e) {
    this.setData({
      'query.goodsName': e.goodsName,
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    this.getList(this.data.query)
  },
  //  顶部 tab切换
  swichTab(e) {
    let idx = e.currentTarget.dataset.idx;
    this.setData({
      currentIdx: idx,
      'query.pageNum': 1
    })
    switch (idx) {
      case '0':
        this.setData({
          'query.priceSort': 1,
          'query.salesSort': '',
        })
        this.getList(this.data.query);
        break;
      case '1':
        this.setData({
          'query.priceSort': '',
          'query.salesSort': 2,
        })
        this.getList(this.data.query);
        break;
    }
  },
  getList(query) {

    wxRepuest.getSearchList(query).then(res => {
      this.totalPage || (this.totalPage = Math.ceil(res.data.total / this.data.query.pageSize));

      let goodsList = res.data.data.list;
      this.setData({
        goodsList: goodsList,
        listShow: false
      })
    }).catch(err => {
      this.setData({
        listShow: true
      })
    })
  },
  // 去商品详情
  goGoodsDetail(e) {
    let type = e.target.dataset.share;
    if (type == 'share') return;
    let goodsId = e.currentTarget.dataset.goodsid;
    let skuId = e.currentTarget.dataset.skuid;
    let eventType = e.currentTarget.dataset.eventtype;
    wx.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?goodsId=${goodsId}&skuId=${skuId}&eventType=${eventType}`,
    })
  },
  onReachBottom() {
    this.data.query.pageNum++;
    if (this.totalPage && this.totalPage >= this.data.query.pageNum) {
      let goodsList = this.data.goodsList
      this.setData({
        'query.pageNum': ++this.data.query.pageNum
      })

      this.getList(this.data.query)
      this.setData({
        goodsList: goodsList.concat(this.data.goodsList)
      })
    }


  },
})