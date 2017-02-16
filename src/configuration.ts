export class Registry {

  private registry: { [key: string]: any[] } = {};

  register(name: string, value: any) {
    if (this.registry[name]) {
      this.registry[name].push(value);
    } else {
      this.registry[name] = [value];
    }
  }
}
