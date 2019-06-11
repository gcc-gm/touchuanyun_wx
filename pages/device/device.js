// pages/device/device.js
const { $Message } = require('../../dist/base/index');
var userinfo;
var statusLock = false;  //防止用户疯狂点击getapi 
Page({
  /**
   * 页面的初始数据
   */

  data: {
    devicesInfoList: [], //放置返回数据的数组  
    dataLimit: 5,   // 从开始索引往下读取的记录条数  
    callbackcount: 0,      //api实际返回数据的个数  
    canLoadingMore: false, //"点击加载更多"的变量，默认false，隐藏  
    hadLoadingComplete: false  //“没有数据”的变量，默认false，隐藏  
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
  handleDuration(msg) {
    $Message({
      content: msg,
      duration: 5
    });
  },

  // 参数英文名	  参数中文名	是否必须	备注
  // token:	token	true	登录成功时返回的 token
  // devid_interval:	查询某个编号段的设备	no	from：开始的设备编号to：结束的设备编号
  // subAccount:	所属用户	no	设备的所属用户
  // page_param	:分页参数	no	offset： 开始索引，从 0 开始 limit：从开始索引往下读取的记录条数
  // search_param:	查询参数	no	模糊查询 参数为
  // sort:	升序降序	no	up：升序 down：降序 （两者不可共存）
  //   type	设备类型	no	设备类型：
  // 0：默认设备
  // 1：LoRa集中器 
  // 2：CoAP/NB-IoT
  // 3 ：LoRa模块
  // 4：网络io
  // 6：LoRaWAN 
  // 7.电信 CoAP / NB - IoT 
  // 8.华为 CoAP/NB-IoT
  /**
 * 从api加载数据
 */
  // groupId	设备分组id	no	用于获取某分组下的设备
  getDataFromApi: function () {
    console.log('in the getDataFromApi')
    statusLock = true;
    //获取缓存中用户信息
    wx.getStorage({
      key: 'userinfo',
      success: (uinfo) => {
        console.log('in userinfo')
        console.log(uinfo.data);
        userinfo = uinfo.data;//缓存中的账户信息
        if (userinfo.token.length != 0) {
          wx.request({
            url: 'https://cloudapi.usr.cn/usrCloud/dev/getDevs',
            method: 'POST',
            data: {
              property_needed: [//模糊参数??
                "name",
                "onlineStatus",
                "pass"
              ],
              page_param: {
                offset: this.data.devicesInfoList.length,
                limit: this.data.dataLimit//取10
              },
              sort: 'up',// up：升序 down：降序 （两者不可共存）
              token: userinfo.token
            },
            success: (res) => {
              console.log('in the http return !!')
              console.log(res);
              if (res.statusCode.toString().startsWith('2')) {
                // 返回状态码为2开头才是http成功的返回,然后进一步检查api私有状态码
                console.log('res.data.status');
                console.log(res.data.status);
                if (res.data.status == 0) {
                  //api返回数据正常
                  var apireturndata = res.data.data;//api返回数据
                  this.setData({ apireturndata: apireturndata });
                  //判断是否有数据，有则取数据  
                  if (apireturndata.total != 0) {//设备信息存在dev字段中
                    console.log(' in the apireturn');
                    console.log(apireturndata)
                    this.data.callbackcount = apireturndata.total;
                    if (apireturndata.dev.length != 0) {
                      var newdata = this.data.devicesInfoList.concat(apireturndata.dev);
                      this.setData({
                        devicesInfoList: newdata
                      })
                    }
                    var currentcount = this.data.devicesInfoList.length + apireturndata.dev.length;
                    if (this.data.callbackcount > currentcount) {//说明api端还有数据没取完整
                      var canLoadingMore = true;//还有数据
                      var hadLoadingComplete = false;
                    } else {
                      var canLoadingMore = false;
                      var hadLoadingComplete = true;//已经完全加载了
                    };
                    this.setData({
                      canLoadingMore: canLoadingMore, //获取数据数组  
                      hadLoadingComplete: hadLoadingComplete  //把"已经全部加载"的变量设为false，显示 
                    });
                  };
                } else if (res.data.status.toString().startsWith('4')) {
                  //status4开头的都是token问题
                  //清楚登陆信息,重新获取token
                  wx.clearStorage();
                  wx.showModal({
                    title: '会话过期',
                    content: '请重新登陆',
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
                        //do nothing
                        console.log('用户点击取消')
                      }
                    }
                  })
                } else {
                  //api返回数据不正常
                  console.log("api返回数据不正常");
                  console.log(res.data.info);
                  this.handleError(res.data.info);
                };
              } else {
                //res.statusCode不是正常的情况/提示错误信息;
                console.log('statusCode' + res.data.errMsg)
                this.handleError("info" + res.data.info);
              };
            },
            fail: (err) => {
              console.log(err);
              this.handleError('好像无网络连接.');
            }
          })
        }
      },
      fail: (err) => {//
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
              //do nothing;
              console.log('用户点击取消')
            }
          }
        })
      }
    });
    statusLock = false;//允许点击
  },
  /**
 *  点击底部加载更多按钮出发
 */
  clickGetMoreData: function (e) {
    if (this.data.devicesInfoList.length <= this.data.callbackcount) {
      if (!statusLock) {
        this.setData({
          dataLimit: this.data.dataLimit + 5,  //每次触发上拉事件，
          canLoadingMore: true//开启加载样式
        });
        this.getDataFromApi();
        setTimeout(() => {
          this.setData({
            canLoadingMore: false//关闭加载样式
          })
        }, 1000)
      } else {
        this.handleWarning('点击太频繁啦');
      }
    } else {
      console.log('devicesInfoList.length < data.callbackcount')
    }
  },
  clickDeviceDetail: function (event) {
    var devicesInfoList = this.data.devicesInfoList;
    var devid = event.currentTarget.dataset.devid;//拿到devid参数
    for (var key in devicesInfoList) {
      if (devicesInfoList[key].devid == devid) {
        var devicedata = devicesInfoList[key];
      };
    };
    wx.navigateTo({
      url: '/pages/datadetail/datadetail?devicedata=' + JSON.stringify(devicedata),
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中',
    });
    this.getDataFromApi()
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
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
    console.log('onshow ')
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onhide ')

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