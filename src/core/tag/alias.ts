import { Events } from '@storefront/flux-capacitor';
import Tag, { ALIAS_DESCRIPTION } from '.';
import * as utils from '../../core/utils';
import Lifecycle from './lifecycle';
import Phase = Lifecycle.Phase;

class Alias {

  aliases: Alias.Description = this.tag[ALIAS_DESCRIPTION] = {
    map: {},
    static: [],
    state: [],
    props: [],
    internal: [],
  };
  hasParent: boolean = !!this.tag.parent;
  parent: Alias.Description = this.hasParent && Alias.getDescription(this.tag.parent);
  oldParentAliases: object = this.parent.map;
  oldState: object;

  constructor(private tag: Tag) { }

  get parentAliases() {
    const { map: parentAliases, internal: privateAliases } = this.parent;

    return Object.keys(parentAliases)
      .filter((alias) => !privateAliases.includes(alias))
      .reduce((aliases, alias) => Object.assign(aliases, { [alias]: parentAliases[alias] }), {});
  }

  attach() {
    this.tag.on(Phase.INITIALIZE, this.onInitialize);
    this.tag.on(Phase.STATE_FINALIZED, this.onStateFinalized);
    this.tag.on(Phase.UPDATE, () => this.tag.trigger(Phase.RECALCULATE_PROPS));
    this.tag.on(Phase.UPDATE, this.onUpdate);
  }

  onInitialize = () => {
    this.oldState = this.tag.state;

    if (this.hasParent) {
      this.inheritAliases();
    }

    const tagMetadata = Tag.getMeta(this.tag);
    if (tagMetadata.alias) {
      this.tag.expose(tagMetadata.alias);
    }
  }

  inheritAliases() {
    const filteredAliases = this.parentAliases;
    this.emit('inherited', 'parent', filteredAliases);

    this.aliases.map = { ...this.aliases.map, ...filteredAliases };
    this.applyAliases(this.aliases.map);
  }

  onStateFinalized = () => {
    if (this.stateAliasesChanged()) {
      this.updateAliases(this.updateStateAliases(this.aliases.map));
    }
  }

  onUpdate = () => {
    const currentAliases = this.aliases.map;
    let newAliases = currentAliases;

    if (this.parentAliasesChanged()) {
      newAliases = this.updateParentAliases(newAliases);
    }

    if (this.stateAliasesChanged()) {
      newAliases = this.updateStateAliases(newAliases);
    }

    if (this.aliases.props.length !== 0) {
      newAliases = this.updatePropsAliases(newAliases);
    }

    if (newAliases !== currentAliases) {
      this.updateAliases(newAliases);
    }
  }

  parentAliasesChanged = () => this.hasParent && this.parent.map !== this.oldParentAliases;

  stateAliasesChanged = () => this.oldState !== this.tag.state && this.aliases.state.length !== 0;

  updateParentAliases(currentAliases: { [key: string]: any }) {
    const selfAliases = [
      ...this.aliases.state,
      ...this.aliases.props,
      ...this.aliases.static
    ];
    const parentAliases = this.oldParentAliases = this.parent.map;

    this.emit('updated', 'parent', parentAliases);

    return {
      ...this.parentAliases,
      ...Object.keys(currentAliases)
        .filter((alias) => selfAliases.includes(alias))
        .reduce((aliases, alias) => Object.assign(aliases, { [alias]: currentAliases[alias] }), {})
    };
  }

  updateStateAliases(currentAliases: { [key: string]: any }) {
    const state = this.tag.state;
    const stateAliases = this.aliases.state;
    const loggableAliases = stateAliases.reduce((aliases, key) => Object.assign(aliases, { [key]: state }), {});
    this.emit('updated', 'state', loggableAliases);

    this.oldState = state;
    return {
      ...currentAliases,
      ...Alias.build(stateAliases, state)
    };
  }

  updatePropsAliases(currentAliases: { [key: string]: any }) {
    const propsAliases = this.aliases.props;
    const props = this.tag.props;
    const loggableAliases = propsAliases.reduce((aliases, key) => Object.assign(aliases, { [key]: props }), {});
    this.emit('updated', 'props', loggableAliases);

    return {
      ...currentAliases,
      ...Alias.build(propsAliases, props)
    };
  }

  updateAliases(newAliases: object) {
    const newAliasNames = Object.keys(newAliases);
    const removedAliases = Object.keys(this.aliases.map)
      .filter((alias) => !newAliasNames.includes(alias));

    this.aliases.map = newAliases;

    if (removedAliases.length !== 0) {
      this.emit('removed', '', removedAliases);
      removedAliases.forEach((alias) => delete this.tag[`$${alias}`]);
    }

    this.applyAliases(newAliases);
  }

  expose(alias: string, value: any) {
    const state = this.tag.state;
    const props = this.tag.props;
    let type;

    this.aliases.map = { ...this.aliases.map, [alias]: value };

    if (value === state && !this.aliases.state.includes(alias)) {
      type = 'state';
      this.aliases.state.push(alias);
    } else if (value === props && !this.aliases.props.includes(alias)) {
      type = 'props';
      this.aliases.props.push(alias);
    } else if (!this.aliases.static.includes(alias)) {
      type = 'static';
      this.aliases.static.push(alias);
    }

    this.emit('added', type, value);
    if (this.tag.isMounted) {
      this.tag.update({ [`$${alias}`]: value });
    } else {
      this.applyAlias(alias, value);
    }
  }

  updateAlias(alias: string, value: any) {
    this.aliases.map = { ...this.aliases.map, [alias]: value };
    this.tag[`$${alias}`] = value;
  }

  unexpose(alias: string) {
    this.aliases.internal.push(alias);
  }

  applyAlias(alias: string, value: any) {
    this.tag[`$${alias}`] = value;
  }

  applyAliases(aliases: object) {
    Object.keys(aliases)
      .forEach((alias) => this.applyAlias(alias, aliases[alias]));
  }

  emit(action: string, type: string, aliases: object) {
    this.tag.flux.emit(Events.TAG_ALIASING, { name: Tag.getMeta(this.tag).name, action, type, aliases });
  }
}

namespace Alias {
  export interface Description {
    static: string[];
    state: string[];
    props: string[];
    internal: string[];
    map: { [key: string]: any };
  }

  export function getDescription(tag: utils.riot.TagInterface): Description {
    return tag[ALIAS_DESCRIPTION];
  }

  export function build(aliasNames: string[], value: any) {
    return aliasNames.reduce((aliases, alias) =>
      Object.assign(aliases, { [alias]: value }), {});
  }
}

export default Alias;
