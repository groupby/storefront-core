import StoreFront from '../storefront';
import { ATTRS, CSS, VIEW } from './system';

export function view(name: string, template: string, css?: string, attrs?: string) {
  return function (target: any) {
    target[VIEW] = template;
    if (css) {
      target[CSS] = css;
    }
    if (attrs) {
      target[ATTRS] = attrs;
    }

    StoreFront.register((register) => register(target, name));
  };
}
