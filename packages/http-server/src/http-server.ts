// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import {AddressInfo} from 'net';
import * as pEvent from 'p-event';
import {
  HttpProtocol,
  HttpServer,
  HttpServerOptions,
  RequestListener,
} from './types';

/**
 * HTTP / HTTPS server used by LoopBack's RestServer
 *
 * @export
 * @class HttpServer
 */
export class DefaultHttpServer implements HttpServer {
  private _port: number;
  private _host?: string;
  private _listening: boolean = false;
  protected _protocol: HttpProtocol;
  private _address: AddressInfo;
  protected readonly requestListener: RequestListener;
  protected _server: http.Server | https.Server;
  protected readonly serverOptions: HttpServerOptions;

  /**
   * @param requestListener
   * @param serverOptions
   */
  constructor(
    requestListener: RequestListener,
    serverOptions?: HttpServerOptions,
  ) {
    this.requestListener = requestListener;
    serverOptions = serverOptions || {};
    this.serverOptions = serverOptions;
    this._port = serverOptions.port || 0;
    this._host = serverOptions.host || undefined;
    this._protocol = serverOptions.protocol || 'http';
    this.createServer();
  }

  /**
   * Create a server for the given protocol
   */
  protected createServer() {
    if (this._protocol === 'https') {
      this.createHttps();
    } else if (this._protocol === 'http2') {
      this.createHttp2();
    } else {
      this.createHttp();
    }
  }

  /**
   * Create an https server
   */
  protected createHttps() {
    this._server = https.createServer(
      this.serverOptions as https.ServerOptions,
      this.requestListener,
    );
  }

  /**
   * Create an http server
   */
  protected createHttp() {
    this._server = http.createServer(this.requestListener);
  }

  /**
   * Create an http/2 server
   *
   * This method is to be implemented by a subclass
   */
  protected createHttp2() {
    // We cannot use the `http2` from node core yet until
    // https://github.com/expressjs/express/pull/3730 is landed and released
    throw new Error('HTTP/2 is not implemented.');
  }

  /**
   * Starts the HTTP / HTTPS server
   */
  public async start() {
    this._server.listen(this._port, this._host);
    await pEvent(this._server, 'listening');
    this._listening = true;
    this._address = this._server.address() as AddressInfo;
  }

  /**
   * Stops the HTTP / HTTPS server
   */
  public async stop() {
    if (!this._server) return;
    this._server.close();
    await pEvent(this._server, 'close');
    this._listening = false;
  }

  /**
   * Protocol of the HTTP / HTTPS server
   */
  public get protocol(): HttpProtocol {
    return this._protocol;
  }

  /**
   * Port number of the HTTP / HTTPS server
   */
  public get port(): number {
    return (this._address && this._address.port) || this._port;
  }

  /**
   * Host of the HTTP / HTTPS server
   */
  public get host(): string | undefined {
    return (this._address && this._address.address) || this._host;
  }

  /**
   * URL of the HTTP / HTTPS server
   */
  public get url(): string {
    let host = this.host;
    if (this._address && this._address.family === 'IPv6') {
      if (host === '::') host = '::1';
      host = `[${host}]`;
    } else if (host === '0.0.0.0') {
      host = '127.0.0.1';
    }
    return `${this.protocol}://${host}:${this.port}`;
  }

  /**
   * State of the HTTP / HTTPS server
   */
  public get listening(): boolean {
    return this._listening;
  }

  public get server(): http.Server | https.Server {
    return this._server;
  }

  /**
   * Address of the HTTP / HTTPS server
   */
  public get address(): AddressInfo | undefined {
    return this._listening ? this._address : undefined;
  }
}

/**
 * Default implementation of HttpServerFactory
 */
export class DefaultHttpServerFactory {
  create(
    requestListener: RequestListener,
    serverOptions?: HttpServerOptions,
  ): HttpServer {
    return new DefaultHttpServer(requestListener, serverOptions);
  }
}
