import siteinfo from '../siteinfo.js'
export default {
  /**
   * @param {场景参数} type 
   * 获取oss 数据
   * type上传类型 1、商品图片 2、商品品牌图片 3、商品分类图片 4、文章图片 5、文章分类图片 6、广告图片 7、个性化配置图片 8、订单图片 9、评论图片
   * ID=orderId; userId(用户id),orderId(订单id),classId(广告分类id)
   */

  getOssData(options) {
    if (!options) {
      return
    }
    let ossObj = {}
    let ossUrl = ''
    let url = `${siteinfo.domain}/1/v2/oss/ossUpload?type=${options.type}&ID=${options.ID}`
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'get',
        success(res) {
          let data = res.data
          ossUrl = data.host; //  需要的host
          // ------- formData 6 项 ----------
          ossObj.name = Math.random().toString(36).substr(2) + Date.now().toString(36);
          ossObj.key = data.key;
          ossObj.policy = data.policy;
          ossObj.OSSAccessKeyId = data.accessid;
          ossObj.callback = data.callback;
          ossObj.signature = data.signature;
          // ------- formData 6 项 ----------

          resolve({
            ossObj: ossObj,
            ossUrl: ossUrl
          })
        },
        fail(err) {
          reject(err)
        }
      })
    }).catch(function (err) {
      console.error(err)
    })

  },

  /**
   * @param { string } tempFilePaths
   *   获取图片 后缀名
   * return  后缀 png  jpg
   */
  getPicInfo(tempFilePaths) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: tempFilePaths,
        success(res) {
          resolve(res.type)
        },
        fail(err) {
          reject(err)
        }
      })
    })

  },
  /**
   * 上传图片 api wx.uploadFile
   */
  upPicFile(url, formData, picPathArr) {

    let urlArr = [] // 最终返回的oss 图片地址
    let photoArr = picPathArr ? picPathArr : []
    return new Promise((resolve, reject) => {

      photoArr.forEach((tempFilePaths) => {
        wx.uploadFile({
          url: url,
          filePath: tempFilePaths,
          header: {
            'content-type': 'multipart/form-data'
          },
          name: 'file',
          formData: formData,
          success(res) {
            
            let urlData = JSON.parse(res.data)
  
            if (urlData.status == 200) { 
              urlArr.push(urlData.url)
              if(urlArr.length == photoArr.length){
                resolve(urlArr)
              }
              
            } else {
              reject(res)
            }

          },
          fail(err) {
            reject(err)
          }
        })


      });
      
    })




  }

}