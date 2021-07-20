'use strict';

const querystring = require('querystring');
const fetch = require('node-fetch');

module.exports = class HuumAPI {

  static API_URL = 'https://api.huum.eu';

  static async login({
    username,
    password,
  }) {
    const qs = querystring.stringify({
      username,
      password,
      version: 3,
    });
    const res = await fetch(`${this.API_URL}/action/login?${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(res.statusText);

    if (json === false) {
      throw new Error('Invalid username or password');
    }

    return json;
  }

  static async getStatus({ sessionHash }) {
    const qs = querystring.stringify({
      session: sessionHash,
      version: 3,
    });
    const res = await fetch(`${this.API_URL}/action/status?${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(res.statusText);
    return json;
  }

  static async setLight({ sessionHash, on = true }) {
    const res = await fetch(`${this.API_URL}/action/light`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        light: on ? 1 : 0,
        session: sessionHash,
        version: 3,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(res.statusText);
    return json;
  }

  static async start({
    sessionHash,
    startDate = Math.round(Date.now() / 1000) + (1 * 60), // Now - 5 minutes
    endDate = Math.round((Date.now() / 1000) + (2 * 60 * 60)), // Now + 3 hours
    targetTemperature,
    humidity,
  }) {
    const res = await fetch(`${this.API_URL}/action/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        targetTemperature,
        humidity,
        session: sessionHash,
        version: 3,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(res.statusText);
    return json;
  }

  static async stop({
    sessionHash,
  }) {
    const qs = querystring.stringify({
      session: sessionHash,
      version: 3,
    });
    const res = await fetch(`${this.API_URL}/action/stop_sauna?${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(res.statusText);
    return json;
  }

};
