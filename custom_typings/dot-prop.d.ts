declare module 'dot-prop' {
  interface DotProp {
    get(obj: any, path: string, defaultValue?: any): any;
    set(obj: any, path: string, value: any): void;
  }

  const dotProp: DotProp;
  export = dotProp;
}
