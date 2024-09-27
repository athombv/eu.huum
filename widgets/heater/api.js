'use strict';

async function getDevice({ homey, userId, saunaId }) {
  if (!homey) {
    throw new Error('Missing Homey');
  }

  if (!userId) {
    throw new Error('Missing User ID');
  }

  if (!saunaId) {
    throw new Error('Missing Sauna ID');
  }

  const driver = await homey.drivers.getDriver('uku');
  const device = driver.getDevices().find(device => device.getData().userId === userId && device.getData().saunaId === saunaId);
  if (!device) {
    throw new Error('Device Not Found');
  }

  return device;
}

module.exports = {
  async getStatus({ homey, query }) {
    const { userId, saunaId } = query;
    const device = await getDevice({ homey, userId, saunaId });

    return {
      name: device.getName(),
      onoff_heater: device.getCapabilityValue('onoff.heater'),
      onoff_lights: device.getCapabilityValue('onoff.lights'),
      target_temperature: device.getCapabilityValue('target_temperature'),
      measure_temperature: device.getCapabilityValue('measure_temperature'),
    };
  },
  async setHeating({ homey, body }) {
    const { userId, saunaId } = body;
    const device = await getDevice({ homey, userId, saunaId });
    await device.triggerCapabilityListener('onoff.heater', body.onoff);
  },
};
