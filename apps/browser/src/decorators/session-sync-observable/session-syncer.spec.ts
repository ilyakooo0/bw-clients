import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, Observable } from "rxjs";

import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";

import { StateService } from "src/services/abstractions/state.service";

import { SessionSyncer } from "./session-syncer";

describe("session syncer", () => {
  it("should throw if observedObject is not an instance of Observable", () => {
    expect(() => {
      new SessionSyncer({}, null, null, null);
    }).toThrowError("observedObject must be an instance of Observable");
  });

  describe("when Observable is provided", () => {
    const observable = Object.create(Observable.prototype, {}) as Observable<any>;

    it("should create if observedObject is an instance of Observable", () => {
      const observable = Object.create(Observable.prototype, {}) as Observable<any>;

      new SessionSyncer(observable, null, null, {
        key: "",
        ctor: String,
        initializer: (s: any) => s,
      });
    });

    it("should create if either ctor or initializer is provided", () => {
      new SessionSyncer(observable, null, null, { key: "", ctor: String });
      new SessionSyncer(observable, null, null, { key: "", initializer: (s: any) => s });
    });

    it("should throw if neither ctor nor initializer is provided", () => {
      expect(() => {
        new SessionSyncer(observable, null, null, { key: "" });
      }).toThrowError("ctor or initializer must be provided");
    });
  });

  describe("observing", () => {
    const key = "Test__observable";
    let stateService: SubstituteOf<StateService>;
    let messagingService: SubstituteOf<MessagingService>;
    let observable: BehaviorSubject<string>;
    let sut: SessionSyncer;

    beforeEach(() => {
      stateService = Substitute.for<StateService>();
      messagingService = Substitute.for<MessagingService>();
      observable = new BehaviorSubject("");

      sut = new SessionSyncer(observable, stateService, messagingService, {
        key: key,
        initializer: (s: any) => s,
      });
    });

    it("should call stateService.setInSessionMemory", () => {
      observable.next("test");
      stateService.received(1).setInSessionMemory(key, "test");
      messagingService.received(1).send(key + "_update", { id: sut.id });
    });
  });
});
