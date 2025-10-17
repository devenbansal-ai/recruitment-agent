class Logger {
  static log = (tag: string, ...args: any[]) => {
    console.log(tag);
    args && args.length && console.log(...args);
  };
}

export default Logger;
