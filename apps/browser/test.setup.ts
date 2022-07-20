// Add chrome storage api
const fn = jest.fn();
const QUOTA_BYTES = 10;
global.chrome = {
  storage: {
    local: {
      set: fn,
      get: fn,
      remove: fn,
      QUOTA_BYTES,
      getBytesInUse: fn,
      clear: fn,
    },
    session: {
      set: fn,
      get: fn,
      has: fn,
      remove: fn,
    },
  },
  runtime: {
    onMessage: {
      addListener: fn,
    },
    sendMessage: fn,
  },
} as any;
