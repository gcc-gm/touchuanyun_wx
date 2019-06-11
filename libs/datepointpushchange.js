const { getTime } = require('../libs/getDate')
/*
devId:设备ID
dataPoints:[{slaveIndex：从机序号,slaveAddr:从机地址,pointId:数据点ID,value:数值},{…},…]
*/
/**
 * 
 * @param {*} event 
 * @param {*} devid 
 * @param {*} deviceSlavesList 从机列表
 */
const DataPointPush = function (event, devid, deviceSlavesList) {
    var deviceSlavesList = deviceSlavesList
    if (event.devId == devid) {
        let dataPointsList = event.dataPoints;
        for (let idx in dataPointsList) {
            for (let key in deviceSlavesList) {
                let dataPoint = dataPointsList[idx];
                let oneslave = deviceSlavesList[key];
                //对应的从机
                if (dataPoint.slaveIndex == oneslave.slaveIndex) {
                    let iotDataList = oneslave.iotDataDescription;
                    for (let index in iotDataList) {
                        let iotData = iotDataList[index];
                        if (iotData.id == dataPoint.pointId) {
                            iotData.value = dataPoint.value;
                            iotData.createTime = getTime(undefined, 'y-M-d h:m')
                            console.log("更新数据 :" + dataPoint.value);
                        }
                    }

                }
            }
        }
    };

    return deviceSlavesList;
}
export {
    DataPointPush
}