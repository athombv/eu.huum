'use strict';

const { Driver } = require('homey');
const HuumAPI = require('./HuumAPI');

module.exports = class HuumDriver extends Driver {

  async onInit() {
    this.homey.flow
      .getActionCard('start_heater')
      .registerRunListener(async ({ device }) => {
        await device.triggerCapabilityListener('onoff.heater', true);
      });

    this.homey.flow
      .getActionCard('stop_heater')
      .registerRunListener(async ({ device }) => {
        await device.triggerCapabilityListener('onoff.heater', false);
      });

    this.homey.flow
      .getActionCard('light_on')
      .registerRunListener(async ({ device }) => {
        await device.triggerCapabilityListener('onoff.light', true);
      });

    this.homey.flow
      .getActionCard('light_off')
      .registerRunListener(async ({ device }) => {
        await device.triggerCapabilityListener('onoff.light', false);
      });
  }

  async onPair(socket) {
    let userId;
    let saunaId;
    let username;
    let password;
    let sessionHash;

    socket.setHandler('login', async data => {
      username = data.username;
      password = data.password;

      const user = await HuumAPI.login({
        username,
        password,
      });

      userId = user.user_id;
      saunaId = user.sauna_id;
      sessionHash = user.session_hash;

      return true;
    });

    socket.setHandler('list_devices', async () => {
      return [{
        name: 'HUUM',
        data: {
          userId,
          saunaId,
        },
        store: {
          sessionHash,
        },
      }];
    });
  }

  async onRepair(socket, device) {
    socket.setHandler('login', async data => {
      const {
        username,
        password,
      } = data;

      const user = await HuumAPI.login({
        username,
        password,
      });

      if (device.getData().userId !== user.user_id) {
        throw new Error('User does not match');
      }

      if (device.getData().saunaId !== user.sauna_id) {
        throw new Error('Sauna does not match');
      }

      await device.setStoreValue('sessionHash', user.session_hash);
      await device.onUninit();
      await device.onInit();

      return true;
    });
  }

};
