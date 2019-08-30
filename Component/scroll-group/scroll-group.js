// component/scroll-group/scroll-group.js
/**
 * 属性/方法
 * 
 * group :数组列表
 * avatarStr :头像的字段名
 * txtStr :下标文字的字段名
 * txt :下标文本
 * txtShow ：下标文本显示条件 有 item,index 参数
 */
Component({
  properties: {
    group: {
      type: Array,
      value: null
    },
    avatarStr: {
      type: String,
      value: null
    },
    txtStr: {
      type: String,
      value: null
    },
    txt: {
      type: String,
      value: null
    },
    txtShow: {
      type: String,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})