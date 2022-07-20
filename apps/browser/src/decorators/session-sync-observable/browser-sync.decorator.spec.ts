import { BehaviorSubject } from "rxjs";

import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";

import { StateService } from "../../services/abstractions/state.service";

import { browserSession } from "./browser-sync.decorator";
import { sessionSync } from "./session-sync.decorator";

// broswerSession initializes SessionSyncers for each sessionSync decorated property
// We don't want to test SessionSyncers, so we'll mock them
jest.mock("./session-syncer");

describe("browserSession decorator", () => {
  it("should throw if StateService or MessagingService is not a constructor argument", () => {
    @browserSession
    class TestClass {}
    expect(() => {
      new TestClass();
    }).toThrowError(
      "Cannot decorate TestClass with browserSession, StateService and MessagingService must be injected"
    );
  });

  it("should create if StateService and MessagingService are constructor arguments", () => {
    const stateService = Object.create(StateService.prototype, {});
    const messagingService = Object.create(MessagingService.prototype, {});

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
      behaviorSubject = new BehaviorSubject("");

      constructor(private stateService: StateService, messagingService: MessagingService) {}

      fromJSON(json: any) {
        this.behaviorSubject.next(json);
      }
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
