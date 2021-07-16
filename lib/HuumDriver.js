'use strict';

const { Driver } = require('homey');
const HuumAPI = require('./HuumAPI');

module.exports = class HuumDriver extends Driver {

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

};
