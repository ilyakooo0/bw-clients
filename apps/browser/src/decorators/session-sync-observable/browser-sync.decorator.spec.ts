import { Observable } from "rxjs";

import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";

import { StateService } from "../../services/abstractions/state.service";

import { browserSession } from "./browser-sync.decorator";
import { sessionSync } from "./session-sync.decorator";

describe("browserSession decorator", () => {
  it("should throw if StateService or MessagingService is not a constructor argument", () => {
    @browserSession
    class TestClass {}
    expect(() => {
      new TestClass();
    }).toThrowError("StateService and MessagingService must be injected");
  });

  it("should create if StateService is a constructor argument", () => {
    const stateService = Object.create(StateService.prototype, {}) as StateService;
    const messagingService = Object.create(MessagingService.prototype, {}) as MessagingService;

    @browserSession
    class TestClass {
      constructor(private stateService: StateService, private messagingService: MessagingService) {}
    }

    new TestClass(stateService, messagingService);
  });

  describe("interaction with @sessionSync decorator", () => {
    let stateService: StateService;
    let messagingService: MessagingService;

    @browserSession
    class TestClass {
      @sessionSync({ initializer: (s: string) => s })
      observable = new Observable<string>();

      constructor(private stateService: StateService, messagingService: MessagingService) {}
    }

    beforeEach(() => {
      stateService = Object.create(StateService.prototype, {}) as StateService;
      messagingService = Object.create(MessagingService.prototype, {}) as MessagingService;
    });

    it("should create a session syncer", () => {
      const testClass = new TestClass(stateService, messagingService) as any;
      expect(testClass.__sessionSyncers.length).toEqual(1);
    });
  });
});
