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

export const alias = metadataDecorator<string>('alias');

export const origin = metadataDecorator<string>('origin');

export const configurable = metadataDecorator('configurable')(true);

export const transform = metadataDecorator<Tag.Transform>('transform');

export const connect = metadataDecorator<Tag.SelectorMap>('selector');

export function metadataDecorator<T>(key: string) {
  return (value: T) => (target: any) => {
    utils.setMetadata(target, key, value);
  };
}
