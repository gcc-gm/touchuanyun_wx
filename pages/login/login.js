// pages/index/index.js
const { $Toast } = require('../../dist/base/index');//toast消息
const { $Message } = require('../../dist/base/index');//全局信息提醒
const passwordMd5 = require('../../libs/md5.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account: '',
    password: ''
  },
  handleLoading() {
    $Toast({
      content: '登录中...',
      type: 'loading'
    });
  },

  handleWarning() {
    $Message({
      content: '这是一条警告提醒',
      type: 'warning'
    });
  },
  handleError(msg) {
    $Message({
      content: msg,
      type: 'error'
    });
  },

  // 获取输入账号
  accountInput: function (e) {
    this.data.account = e.detail.detail.value;
  },

  // 获取输入密码
  passwordInput: function (e) {
    this.data.password = passwordMd5.hexMD5(e.detail.detail.value);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync('token')) {
      //token存在, 已经登陆
      //切换到首页
      wx.switchTab({
        url: '/pages/index/index',
        success: (res) => {
          console.log(' redeirectto index');
        }
      });
    } else {
      try {
        var account = wx.getStorageSync('account');
        var password = wx.getStorageSync('password');
        // if (account && password) {
        if (1) {
          this.setData({
            account: 'luorihuanying',//luorihuanying
            password: passwordMd5.hexMD5('as?369')
          });
          this.cloudLogining();//当缓存中存在账户和密码就直接调用logining()进行登录
        };
      } catch (e) {
        console.log(e);
      }
    };


  },
  cloudLogin: function () {
    //点击登录
    console.log('cloudLogin');
    if (this.data.account.length == 0 || this.data.password.length == 0) {
      this.handleError('账号或密码为空!');
    } else {
      this.cloudLogining();
    }
  },
  cloudLogining: function () {
    this.handleLoading();
    wx.request({
      url: 'https://cloudapi.usr.cn/usrCloud/user/login',
      method: 'POST',
      data: {
        account: this.data.account,
        password: this.data.password
      },
      success: (res) => {
        if (res.data.status == 0) {
          console.log('登陆');
          try {
            wx.setStorageSync('userinfo', res.data.data);//缓存用户数据
            wx.setStorageSync('account', this.data.account);
            wx.setStorageSync('password', this.data.password);
            wx.setStorageSync('token', res.data.data.token);
          } catch (e) {
            console.log(e);
            this.handleError('写入缓存数据失败!')
          }

        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1000
          })
        }
      },
      fail: function (err) {
        console.log(err);
        wx.showToast({
          title: err,

        })
      }, complete: function (res) {
        setTimeout(function () {
          wx.hideLoading();
        }, 1000)

      }
    })
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