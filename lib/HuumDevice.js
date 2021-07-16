'use strict';

const { Device } = require('homey');
const HuumAPI = require('./HuumAPI');

module.exports = class HuumDevice extends Device {

  static POLL_INTERVAL = 1000 * 5; // 5s

  async onInit() {
    this.onPoll().catch(this.error);
    this.onPollInterval = this.homey.setInterval(() => {
      this.onPoll().catch(this.error);
    }, this.constructor.POLL_INTERVAL);

    this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
    this.registerCapabilityListener('onoff.light', this.onCapabilityOnOffLight.bind(this));
  }

  async onDeleted() {
    if (this.onPollInterval) {
      this.homey.clearInterval(this.onPollInterval);
    }
  }

  async onCapabilityTargetTemperature(value) {
    const { sessionHash } = this.getStore();
    const status = await HuumAPI.start({
      sessionHash,
      targetTemperature: value,
    });
    await this.onStatus(status);
  }

  async onCapabilityOnOffLight(value) {
    const { sessionHash } = this.getStore();
    const status = await HuumAPI.setLight({
      sessionHash,
      on: value,
    });
    await this.onStatus(status);
  }

  async onPoll() {
    const { sessionHash } = this.getStore();

    const status = await HuumAPI.getStatus({ sessionHash });
    await this.onStatus(status);
  }

  async onStatus(status) {
    this.log('Status:', status);

    if (typeof status.temperature === 'string') {
      this.setCapabilityValue('measure_temperature', parseFloat(status.temperature)).catch(this.error);
    } else {
      this.setCapabilityValue('measure_temperature', null).catch(this.error);
    }

    if (typeof status.targetTemperature === 'string') {
      this.setCapabilityValue('target_temperature', parseFloat(status.targetTemperature)).catch(this.error);
    } else {
      this.setCapabilityValue('target_temperature', null).catch(this.error);
    }

    if (typeof status.humidity === 'number') {
      this.setCapabilityValue('measure_humidity', status.humidity * 10).catch(this.error);
    } else {
      this.setCapabilityValue('measure_humidity', null).catch(this.error);
    }

    if (typeof status.light === 'number') {
      this.setCapabilityValue('onoff.light', !!status.light).catch(this.error);
    } else {
      this.setCapabilityValue('onoff.light', null).catch(this.error);
    }

    if (typeof status.door === 'boolean') {
      this.setCapabilityValue('alarm_contact.door', status.door === false).catch(this.error);
    } else {
      this.setCapabilityValue('alarm_contact.door', null).catch(this.error);
    }

    if (status.steamerError === 1) {
      this.setWarning(this.homey.__('steamerError')).catch(this.error);
    } else {
      this.unsetWarning().catch(this.error);
    }
  }

};
