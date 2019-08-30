Component({
  properties: {
    color: {
      type: String,
      value: '#999'
    },
    activeColor: {
      type: String,
      value: '#df625c'
    },
    skepsData: {
      type: Array,
      value: [{
        addr: '未获取到地址',
        date: '2019-12-30 24:00'
      }]
    },
    addrStr: {
      type: String,
      value: 'addr'
    },
    dateStr: {
      type: String,
      value: 'date'
    },
    type: {
      type: String,
      value: ''
    }
  },
  externalClasses: ['skeps-one', 'skep-ring', 'skep-addr'],
})