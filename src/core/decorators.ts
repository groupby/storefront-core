import StoreFront from '../storefront';
import Tag from '../tag';

export function tag(name: string, template: string, css?: string) {
  return (target: any = function() { return this; }) => {
    const description = Tag.getDescription(target);

    description.name = name;
    description.view = template;

    if (css) {
      description.css = css;
    }

    StoreFront.register((register) => register(target, name));
  };
}

export function view(name: string, template: string, css?: string) {
  exports.tag(name, template, css)();
}

export function css(style: string) {
  return (target: any) => {
    Object.assign(Tag.getDescription(target), { css: style.toString() });
  };
}

export function alias(name: string) {
  return (target: any) => {
    Object.assign(Tag.getDescription(target), { alias: name });
  };
}
