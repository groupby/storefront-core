import StoreFront from '../../storefront';
import Tag from '../tag';
import utils from './utils';

export function tag(name: string, template: string, css?: string) {
  return (target: any = function() { return this; }) => {
    const description = Tag.getDescription(target);
    const newDescription = {
      ...description,
      metadata: { ...description.metadata, name },
      view: template
    };

    if (css) {
      newDescription.css = css;
    }

    Tag.setDescription(target, newDescription);
    StoreFront.register((register) => register(target, name));
  };
}

export function view(name: string, template: string, css?: string) {
  exports.tag(name, template, css)();
}

export function css(style: string) {
  return (target: any) => {
    Tag.setDescription(target, {
      ...Tag.getDescription(target),
      css: style.toString()
    });
  };
}

export function alias(name: string) {
  return (target: any) => {
    utils.setMetadata(target, 'alias', name);
  };
}

export function origin(name: string) {
  return (target: any) => {
    utils.setMetadata(target, 'origin', name);
  };
}

export function configurable(target: any) {
  utils.setMetadata(target, 'configurable', true);
}

export function transform(trfm: Tag.Transform) {
  return (target: any) => {
    utils.setMetadata(target, 'transform', trfm);
  };
}
