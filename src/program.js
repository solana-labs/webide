import EventEmitter from 'event-emitter';

import {createRpcClient} from './rpc-client';

export class Program {
  modified = false;
  _ee = new EventEmitter();
  _rpcClient = createRpcClient(window.location.origin);

  constructor() {
    Object.assign(this, {
      language: 'Rust',
      name: '',
      description: '',
      source: '',
      uri: '',
    });
  }

  async load(uri) {
    console.log('Loading program:', uri);
    this.uri = uri;

    try {
      const res = await this._rpcClient.request('load', [uri]);
      console.log('load result', res);

      if (res.error) {
        throw new Error(res.error.message);
      }
      const program = res.result;

      this.description = program.description;
      this.language = program.language;
      this.name = program.name;
      this.source = program.source;
      this.modified = false;
      this._ee.emit('modified');
    } catch (err) {
      console.log('Failed to load program:', err);
    }
  }

  async save() {
    console.log('Saving program:', this.uri);

    const program = {
      description: this.description,
      language: this.language,
      name: this.name,
      source: this.source,
    };
    const res = await this._rpcClient.request('save', [program]);
    console.log('save result', res);
    if (res.error) {
      throw new Error(res.error.message);
    }
    const uri = res.result;

    this.uri = uri;
    this.modified = false;
    this._ee.emit('modified');
    console.log('Saved program:', this.uri);
  }

  set(key, value) {
    //console.log(`Program: ${key}=${value}`);
    this[key] = value;
    this.modified = true;
    this._ee.emit('modified');
  }

  on(event, fn) {
    this._ee.on(event, fn);
  }

  removeListener(event, fn) {
    this._ee.off(event, fn);
  }
}

