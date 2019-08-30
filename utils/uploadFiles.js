/**
 * 图片上传通用请求，上传图片，返回的是图片URL
 * filePath  本地图片
 */
import Siteinfo from "../siteinfo.js";
export function uploadFiles(filePath) {
  // 上传文件通用接口
  let url = `${Siteinfo.domain}/${Siteinfo.subDomain && (Siteinfo.subDomain + '/')}${Siteinfo.apiVersion && (Siteinfo.apiVersion + '/')}${options.url}`,
    token = wx.getStorageSync("token");
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: "file",
      header: {
        "content-type": "multipart/form-data",
        "x-user-token": token
      },
      success: function (res) {
        let data = JSON.parse(res.data);
        if (data.code == 200) {
          resolve(data.link);
        } else {
          reject(data.message);
        }
      }
    });
  }).catch(function (e) {
    wx.showToast({
      title: e,
      icon: "none",
      duration: 1500
    });
  });
}