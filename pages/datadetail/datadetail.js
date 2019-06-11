// pages/datadetail/datadetail.js
// const passwordMd5 = require('../../libs/md5.js');
const UsrCloud = require('../../libs/usrCloudWx');
const { $Message } = require('../../dist/base/index');
const { getTime } = require('../../libs/getDate');
const { DataPointPush } = require('../../libs/datepointpushchange')
var usrCloud;
var userInfo;
var password;
var token;
var code
Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: {},//一个对象
    deviceSlavesList: [],
    datapintslist: []
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
  /**
   * 如果设备在线就开始websocket连接 否则只显示历史数据
   */
  openWebSocketConnect: function () {
    //实例化
    var that = this;
    usrCloud = new UsrCloud();
    // console.log('usercloud')
    // console.log(UsrCloud)
    var version = usrCloud.USR_GetVer();
    wx.showLoading({
      title: '连接Socket中',
    });
    setTimeout(() => {
      wx.hideLoading();
    }, 1000);
    /**
    *回调函数USR_onConnAck: 连接回调,
    */
    function USR_onConnAck(e) {
      console.log('USR_onConnAck', e);
      if (e.code == 0) {
        that.handleSuccess('连接成功!');
        /**
         * 参数	描述 USR_SubscribeDevParsed(订阅设备解析后的数据)
          devId	设备ID。指定要订阅哪个设备发来的消息。如果要订阅多个,请用逗号隔开;如果要订阅帐号下所有的设备的消息,请传入空。
         */
        usrCloud.USR_SubscribeDevParsed(that.data.deviceInfo.devid);
        // setTimeout(function () {
        //   //USR_SubscribeUserParsed(订阅账号下全部设备解析后的数据)
        //   usrCloud.USR_SubscribeUserParsed(userInfo.account);
        // }, 100);
        //username	用户名。指定要订阅哪个账号下设备发来的消息。
      } else {
        that.handleError('连接失败!')
      }
    }
    /** 
     USR_onConnLost: 连接断开回调,
     */
    function USR_onConnLost(e) {
      // code = 1;//断开连接
      that.handleDefault('socket已经断开')
      console.log('USR_onConnLost', e);
    }
    /**
     *  USR_OnRcvParsedDataPointPush(接收数据点变化推送回调)
     * 触发条件: 接收到数据点变化推送时
     * @param {*} event {devId:设备ID
                         dataPoints:[{slaveIndex：从机序号,slaveAddr:从机地址,pointId:数据点ID,value:数值},{…},…]
                        }
     */
    function USR_onRcvParsedDataPointPush(event) {
      that.handleDefault('收到数据更新')
      let deviceSlavesList = that.data.deviceSlavesList;
      let devid = that.data.deviceInfo.devid;
      let newDeviceSlavesList = DataPointPush(event, devid, deviceSlavesList)
      that.setData({
        deviceSlavesList: newDeviceSlavesList
      });
      console.log('数据记录 : ' + code++);
    }
    /**
     * USR_onSubscribeAck: 订阅响应回调,
     * @param {*} e 
     */
    function USR_onSubscribeAck(e) {
      //that.handleSuccess('订阅成功!');
      console.log('订阅成功', e);
    }
    /**
     * USR_onUnSubscribeAck:取消订阅响应回调 ,
     * @param {*} e 
     */
    function USR_onUnSubscribeAck(e) {
      that.handleSuccess('取消订阅成功!');
      console.log('取消订阅成功', e);
    }
    /**
     *  USR_OnRcvParsedDevStatusPush(接收设备上下线推送回调)
     *return {
     * devId:设备ID
      slaveIndex:从机序号
      slaveAddr:从机地址
      status:在线状态(0/1)
     }
     * @param {*} e 
     */
    function USR_onRcvParsedDevStatusPush(e) {
      that.setData({
        status: e.status
      });
      console.log('设备上下线推送数据回调', e);
    }
    /**
     * USR_onRcvParsedDevAlarmPush:接收解析后报警数据回调,
     * @param {*} event 
     */
    function USR_onRcvParsedDevAlarmPush(event) {

      console.log('接收解析后报警数据回调');
      console.log(event);
    }
    let callback = {
      USR_onConnAck: USR_onConnAck,
      USR_onConnLost: USR_onConnLost,
      USR_onRcvParsedDataPointPush: USR_onRcvParsedDataPointPush,
      USR_onSubscribeAck: USR_onSubscribeAck,
      USR_onUnSubscribeAck: USR_onUnSubscribeAck,
      USR_onRcvParsedDevStatusPush: USR_onRcvParsedDevStatusPush,
      USR_onRcvParsedDevAlarmPush: USR_onRcvParsedDevAlarmPush
    };
    // USR_Init(初始化)
    usrCloud.Usr_Init('clouddata.usr.cn', 8080, version, callback);
    code = usrCloud.USR_Connect(userInfo.account, password);
    console.log('connectCode: ' + code);
    // 0	连接成功
    // 1	用户名为空
    // 2	密码为空
    // 3	连接失败
  },
  /**
   * 根据设备获取数据点列表
   */
  getDataPointInfoByDevice: function () {
    console.log('in getDataPointInfoByDevice')
    wx.request({
      url: 'https://cloudapi.usr.cn/usrCloud/datadic/getDataPointInfoByDevice',
      method: 'POST',
      data: {
        deviceIds: [
          this.data.deviceInfo.devid
        ],
        token: userInfo.token
      },
      success: (res) => {
        // console.log('in the http return !!')
        // console.log(res);
        if (res.statusCode.toString().startsWith('2')) {
          // 返回状态码为2开头才是http成功的返回,然后进一步检查api私有状态码
          // console.log('res.data.status');
          // console.log(res.data.status);
          var apireturndata = res.data;//api返回数据
          if (apireturndata.status == 0) {
            //api返回数据正常
            //判断是否有数据，有则取数据
            var dataPointInfoList = apireturndata.data;//设备下的从机信息
            var deviceSlavesList = []
            if (dataPointInfoList.length != 0) {
              var dataList = dataPointInfoList[0].slaves
              deviceSlavesList = this.handleSlavesData(dataList);
              // console.log("deviceSlavesList :");
              // console.log(deviceSlavesList);
              var devDataIds = this.makeDevDataId(deviceSlavesList);
              this.getLastDataFromApi(devDataIds, deviceSlavesList)
            };
          } else {
            //api返回数据不正常
            console.log("api返回status不正常");
            console.log(res.data.info);
            this.handleError(res.data.info);
          };
        } else if (res.data.status.toString().startsWith('4')) {
          //status 4开头的都是token问题
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
          //res.statusCode不是正常的情况/提示错误信息;
          console.log('statusCode' + res.data.errMsg)
          this.handleError('info' + res.data.info);
        };
      },
      fail: (err) => {
        console.log(err);
        this.handleError('好像无网络连接.');
      }
    })
  },
  /**
   * 处理数据的时间格式
   */
  handleSlavesData: function (dataList) {
    var dataList = dataList;
    for (let idx in dataList) {
      let oneSlave = dataList[idx];
      if (oneSlave.updateDate) {
        oneSlave.updateDate = getTime(oneSlave.updateDate / 1000, 'y-M-d h:m')
      };
      if (oneSlave.createDate) {
        oneSlave.createDate = getTime(oneSlave.createDate / 1000, 'y-M-d h:m')
      };
      if (oneSlave.iotDataDescription.length != 0) {
        var iotDataDescriptionList = oneSlave.iotDataDescription
        for (let key in iotDataDescriptionList) {
          let iotData = iotDataDescriptionList[key];
          iotData.deviceId = oneSlave.deviceId;
          iotData.slaveIndex = oneSlave.slaveIndex;
          switch (iotData.type) {
            case 0:
              iotData.type = '数值类型0';
              break;
            case 1:
              iotData.type = '数值类型1';
              break;
            case 2:
              iotData.type = '数值类型2';
              break;
            default:
              break;
          };
        }
      }
    }
    return dataList;
  },
  getLastDataFromApi: function (devDataIds, deviceSlavesList) {
    //再去获取属于此设备的最后一条数据
    // console.log('传入参数是devDataIds:')
    // console.log(devDataIds);
    wx.request({
      url: 'https://cloudapi.usr.cn/usrCloud/datadic/getLastData',
      method: 'POST',
      data: {
        devDataIds: devDataIds,
        token: token
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        // console.log('in the http return !!')
        // console.log(res);
        if (res.statusCode.toString().startsWith('2')) {
          // 返回状态码为2开头才是http成功的返回,然后进一步检查api私有状态码
          console.log('res.data.status');
          console.log(res.data.status);
          var apireturndata = res.data;//api返回数据
          if (apireturndata.status == 0) {
            //api返回数据正常
            //判断是否有数据，有则取数据
            var datapintslist = []
            var datapintslist = apireturndata.data;
            if (datapintslist.length != 0) {
              /**
               * 处理时间格式
               */
              for (let key in datapintslist) {
                datapintslist[key].createTime = getTime(datapintslist[key].createTime, 'M-d h:m:s');
              }
              /**
               * makeshowdate
               */
              for (let idx in deviceSlavesList) {
                let oneSlave = deviceSlavesList[idx]
                for (let idx2 in datapintslist) {
                  let onedatapoint = datapintslist[idx2];
                  if (oneSlave.slaveIndex == onedatapoint.slaveIndex) {
                    let iotdata = oneSlave.iotDataDescription
                    for (let i in iotdata) {
                      let thedatapoint = iotdata[i];
                      if (onedatapoint.dataPointId == thedatapoint.id) {
                        onedatapoint.name = thedatapoint.name;
                        onedatapoint.type = thedatapoint.type;
                        onedatapoint.unit = thedatapoint.unit;
                        thedatapoint.value = onedatapoint.value;
                        thedatapoint.createTime = onedatapoint.createTime;
                        thedatapoint.alarm = onedatapoint.alarm;
                      }
                    }
                  }
                }
              }
              //数据更新;
              this.setData({
                datapintslist: datapintslist,
                deviceSlavesList: deviceSlavesList
              })
            };
          } else {
            //api返回数据不正常
            console.log("api返回status不正常");
            console.log(res.data.info);
            this.handleError(res.data.info);
          };
        } else if (res.data.status.toString().startsWith('4')) {
          wx.clearStorage(); //清楚登陆信息,重新获取token
          wx.showModal({ //status 4开头的都是token问题
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
          //res.statusCode不是正常的情况/提示错误信息;
          console.log('statusCode' + res.data.errMsg)
          this.handleError('info' + res.data.info);
        };
      }
    })
  },
  checkdetail: function (event) {
    console.log(event)
    var slaveindex = event.currentTarget.dataset.slaveindex;
    var datapointid = event.currentTarget.dataset.datapointid;
    var value = 12;
    // var connectCode = usrCloud.USR_Connect(userInfo.account, password);
    // this.handleSuccess('建立连接!!');
    // console.log('connectCode: ' + connectCode);
    var returnCode = usrCloud.USR_PublishParsedSetSlaveDataPoint(slaveindex, datapointid, value);
    this.handleSuccess('发送数据成功!!');
    console.log(returnCode);

    // usrCloud.USR_Connect(userInfo.account, password);
    // var returnCode = usrCloud.USR_PublishParsedSetSlaveDataPoint(slaveindex, datapointid, value);
    // this.handleSuccess('发送数据成功!!');
    // console.log(returnCode);

  },
  /**
 * 制作一个获取最后一条数据的数组
 */
  makeDevDataId: function (deviceSlavesList) {
    console.log("deviceSlavesList is :")
    console.log(deviceSlavesList)
    var devDataIds = [];//iotDataDescription
    for (var idx in deviceSlavesList) {
      var oneSlave = deviceSlavesList[idx];
      var iotDataDescription = oneSlave.iotDataDescription;
      for (var key in iotDataDescription) {
        var DataDevId = {
          'devId': iotDataDescription[key].deviceId,
          'slaveIndex': iotDataDescription[key].slaveIndex,
          'dataId': iotDataDescription[key].id
        }
        devDataIds.push(DataDevId);
      }
    }
    console.log("devDataIds is :")
    console.log(devDataIds)
    return devDataIds;
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    var devicedata = JSON.parse(options.devicedata);//拿到设备数据参数
    this.setData({
      deviceInfo: devicedata
    });
    wx.getStorage({
      key: 'userinfo',
      success: (res) => {
        userInfo = res.data;
        wx.getStorage({
          key: 'password',
          success: (res) => {
            password = res.data;
            //开启websocket
            this.openWebSocketConnect();
          }
        })
      }
    });
    wx.getStorage({
      key: "token",
      success: (res) => {
        token = res.data
        this.getDataPointInfoByDevice();
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
    //usrCloud.USR_DisConnect();
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
  },
})