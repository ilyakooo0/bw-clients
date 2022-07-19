import { Observable } from "rxjs";

import { SessionSyncer } from "./session-syncer";

describe("session syncer", () => {
  it("should throw if observedObject is not an instance of Observable", () => {
    expect(() => {
      new SessionSyncer({}, null);
    }).toThrowError("observedObject must be an instance of Observable");
  });

  it("should create if observedObject is an instance of Observable", () => {
    const observable = Object.create(Observable.prototype, {}) as Observable<any>;

    new SessionSyncer(observable, null);
  });
});
