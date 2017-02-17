import { Service } from '../core';
import logging from './logging';

const SERVICES: Service.Constructor.Map = { logging };

export default SERVICES;

export interface CoreServices {
  [key: string]: Service.Options<any>;
  logging?: Service.Options<logging.Options>;
}
