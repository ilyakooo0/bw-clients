import { Observable } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";

import { browserSession } from "./browser-sync.decorator";
import { sessionSync } from "./session-sync.decorator";

describe("browserSession decorator", () => {
  it("should throw if StateService is not a constructor argument", () => {
    @browserSession
    class TestClass {}
    expect(() => {
      new TestClass();
    }).toThrowError("StateService must be injected");
  });

  it("should create if StateService is a constructor argument", () => {
    const stateService = Object.create(StateService.prototype, {}) as StateService;

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
      observable = new Observable<string>();

      constructor(private stateService: StateService) {}
    }

    beforeEach(() => {
      stateService = Object.create(StateService.prototype, {}) as StateService;
    });

    it("should create a session syncer", () => {
      const testClass = new TestClass(stateService) as any;
      expect(testClass.__sessionSyncers.length).toEqual(1);
    });

    it("should fail if sessionSync is not an observable", () => {
      class FailingTestClass extends TestClass {
        @sessionSync({ initializer: (s: string) => s }) s = "s";

        constructor(stateService: StateService) {
          super(stateService);
        }
      }

      expect(() => {
        new FailingTestClass(stateService);
      }).toThrowError("s is not an observable");
    });
  });
});
