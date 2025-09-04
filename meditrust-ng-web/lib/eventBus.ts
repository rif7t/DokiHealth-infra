type Callback = (value: number) => void;

const listeners: Callback[] = [];

export function subscribe(p0: string, cb: Callback) {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function publish(p0: string, value:number) {
  listeners.forEach((cb) => cb(value));
}
