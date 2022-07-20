import { BehaviorSubject } from "rxjs";

import { StateService } from "../../services/abstractions/state.service";

import { browserSession } from "./browser-sync.decorator";
import { sessionSync } from "./session-sync.decorator";

// browserSession initializes SessionSyncers for each sessionSync decorated property
// We don't want to test SessionSyncers, so we'll mock them
jest.mock("./session-syncer");

describe("browserSession decorator", () => {
  it("should throw if StateService is not a constructor argument", () => {
    @browserSession
    class TestClass {}
    expect(() => {
      new TestClass();
    }).toThrowError("Cannot decorate TestClass with browserSession, StateService must be injected");
  });

  it("should create if StateService are constructor arguments", () => {
    const stateService = Object.create(StateService.prototype, {});

    @browserSession
    class TestClass {
      constructor(private stateService: StateService) {}
    }

    new TestClass(stateService);
  });

  describe("interaction with @sessionSync decorator", () => {
    let stateService: StateService;

    @browserSession
    class TestClass {
      @sessionSync({ initializer: (s: string) => s })
      behaviorSubject = new BehaviorSubject("");

      constructor(private stateService: StateService) {}

      fromJSON(json: any) {
        this.behaviorSubject.next(json);
      }
    }

    beforeEach(() => {
      stateService = Object.create(StateService.prototype, {}) as StateService;
    });

    it("should create a session syncer", () => {
      const testClass = new TestClass(stateService) as any;
      expect(testClass.__sessionSyncers.length).toEqual(1);
    });
  });
});
