import StoreFront from '../storefront';
import { ATTRS, CSS, DEFAULTS, NAME, VIEW } from '../tag';
import { CORE } from './system';

export const core = (target) => { target[CORE] = true; };

export function view(name: string, template: string, defaults?: any, css?: string, attrs?: string) {
  return (target: any) => {
    target[NAME] = name;
    target[VIEW] = template;
    if (defaults) {
      target[DEFAULTS] = defaults;
    }
    if (css) {
      target[CSS] = css;
    }
    if (attrs) {
      target[ATTRS] = attrs;
    }

    StoreFront.register((register) => register(target, name));
  };
}

export function attr(name: string, expression: string) {
  return (target: any) => {
    target[ATTRS] = `${(target[ATTRS] || '')} ${name}="${expression}"`;
  };
}

export function css(style: string) {
  return (target: any) => { target[CSS] = style; };
}

export function defaults(config: any) {
  return (target: any) => { target[DEFAULTS] = config; };
}
