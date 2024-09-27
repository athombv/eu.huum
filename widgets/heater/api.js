'use strict';

module.exports = {
  async getStatus({ homey, query }) {
    const { userId, saunaId } = query;
    if (!userId || !saunaId) {
      throw new Error('Missing Query');
    }

    const driver = await homey.drivers.getDriver('uku');
    const device = driver.getDevices().find(device => device.getData().userId === userId && device.getData().saunaId === saunaId);
    if (!device) {
      throw new Error('Device Not Found');
    }

    return {
      name: device.getName(),
      onoff: device.getCapabilityValue('onoff'),
      target_temperature: device.getCapabilityValue('target_temperature'),
      measure_temperature: device.getCapabilityValue('measure_temperature'),
    };
  },
};
