import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, Observable } from "rxjs";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SessionSyncer } from "./session-syncer";

describe("session syncer", () => {
  const stateService = Substitute.for<StateService>();

  it("should throw if observedObject is not an instance of Observable", () => {
    expect(() => {
      new SessionSyncer({}, stateService, null);
    }).toThrowError("observedObject must be an instance of Observable");
  });

  describe("when Observable is provided", () => {
    const observable = Object.create(Observable.prototype, {}) as Observable<any>;

    it("should create if observedObject is an instance of Observable", () => {
      const observable = Object.create(Observable.prototype, {}) as Observable<any>;

      new SessionSyncer(observable, stateService, {
        key: "",
        ctor: String,
        initializer: (s: any) => s,
      });
    });

    it("should create if either ctor or initializer is provided", () => {
      new SessionSyncer(observable, stateService, { key: "", ctor: String });
      new SessionSyncer(observable, stateService, { key: "", initializer: (s: any) => s });
    });

    it("should throw if neither ctor nor initializer is provided", () => {
      expect(() => {
        new SessionSyncer(observable, stateService, { key: "" });
      }).toThrowError("ctor or initializer must be provided");
    });
  });

  describe("observing", () => {
    const key = "Test__observable";
    let stateService: SubstituteOf<StateService>;
    let sendMessageSpy: jest.SpyInstance;
    let observable: BehaviorSubject<string>;
    let sut: SessionSyncer;

    beforeEach(() => {
      stateService = Substitute.for<StateService>();
      sendMessageSpy = jest.spyOn(BrowserApi, "sendMessage");
      observable = new BehaviorSubject("");

      sut = new SessionSyncer(observable, stateService, {
        key: key,
        initializer: (s: any) => s,
      });
    });

    it("should call stateService.setInSessionMemory", () => {
      observable.next("test");
      stateService.received(1).setInSessionMemory(key, "test");
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith(key + "_update", { id: sut.id });
    });
  });
});
