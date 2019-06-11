// pages/index/index.js

const { $Message } = require('../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  handleDefault(msg) {
    $Message({
      content: msg
    });
  },
  handleSuccess(msg) {
    $Message({
      content: msg,
      type: 'success'
    });
  },
  handleWarning(msg) {
    $Message({
      content: msg,
      type: 'warning'
    });
  },
  handleError(msg) {
    $Message({
      content: msg,
      type: 'error'
    });
  },
  handleDuration() {
    $Message({
      content: msg,
      duration: 5
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    try {
      var token = wx.getStorageSync('token');
      if (!token) {
        console.log('无法获取token ');
        wx.showModal({
          title: '你还没登陆!',
          content: '请前往登陆',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              //跳转到登陆界面
              wx.navigateTo(
                {
                  url: '/pages/login/login'
                }
              );
            } else if (res.cancel) {
              //
              that.handleError("用户点击取消")
              console.log('用户点击取消')

            }
          }
        })
      };
    } catch (e) {
      this.handleError('无法获取缓存!');
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})