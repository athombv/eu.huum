'use strict';

const Homey = require('homey');

class HuumApp extends Homey.App {

  onInit() {
    try {
      this.homey.dashboards
        .getWidget('heater')
        .registerSettingAutocompleteListener('device', async (query, settings) => {
          const driver = await this.homey.drivers.getDriver('uku');
          const devices = await driver.getDevices();

          return Object.values(devices)
            .map(device => ({
              userId: device.getData().userId,
              saunaId: device.getData().saunaId,
              name: device.getName(),
            }))
            .filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
        });
    } catch (err) {
      this.log(`Dashboards might not be available: ${err.message}`);
    }
  }

}

module.exports = HuumApp;
