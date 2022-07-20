import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { description } from "commander";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SessionSyncer } from "./session-syncer";

describe("session syncer", () => {
  const key = "Test__behaviorSubject";
  let stateService: SubstituteOf<StateService>;
  let sut: SessionSyncer;

  beforeEach(() => {
    stateService = Substitute.for<StateService>();
  });

  describe("initialization", () => {
    describe("input errors", () => {
      it("should throw if behaviorSubject is not an instance of BehaviorSubject", () => {
        expect(() => {
          new SessionSyncer({}, stateService, null);
        }).toThrowError("behaviorSubject must be an instance of BehaviorSubject");
      });

      describe("when BehaviorSubject is provided", () => {
        const behaviorSubject = new BehaviorSubject("");

        it("should create if behaviorSubject is an instance of BehaviorSubject", () => {
          new SessionSyncer(behaviorSubject, stateService, {
            key: key,
            ctor: String,
            initializer: (s: any) => s,
          });
        });

        it("should create if either ctor or initializer is provided", () => {
          new SessionSyncer(behaviorSubject, stateService, { key: key, ctor: String });
          new SessionSyncer(behaviorSubject, stateService, {
            key: key,
            initializer: (s: any) => s,
          });
        });

        it("should throw if neither ctor nor initializer is provided", () => {
          expect(() => {
            new SessionSyncer(behaviorSubject, stateService, { key: key });
          }).toThrowError("ctor or initializer must be provided");
        });
      });
    });
  });

  describe("successful initialize", () => {
    let behaviorSubject: BehaviorSubject<string>;

    beforeEach(() => {
      behaviorSubject = new BehaviorSubject("");

      sut = new SessionSyncer(behaviorSubject, stateService, {
        key: key,
        initializer: (s: any) => s,
      });
    });

    describe("init", () => {
      let observeSpy: jest.SpyInstance;
      let listenForUpdatesSpy: jest.SpyInstance;

      beforeEach(() => {
        observeSpy = jest.spyOn(sut, "observe").mockReturnValue();
        listenForUpdatesSpy = jest.spyOn(sut, "listenForUpdates").mockReturnValue();

        sut.init();
      });

      it("should start observing", () => {
        expect(observeSpy).toHaveBeenCalled();
      });

      it("should start listening", () => {
        expect(listenForUpdatesSpy).toHaveBeenCalled();
      });
    });

    describe("observing", () => {
      const next = "test";
      let updateSessionSpy: jest.SpyInstance;

      beforeEach(() => {
        sut.init();

        updateSessionSpy = jest.spyOn(sut, "updateSession").mockResolvedValue();
        behaviorSubject.next(next);
      });

      it("should call updateSession", () => {
        expect(updateSessionSpy).toHaveBeenCalledTimes(1);
        expect(updateSessionSpy).toHaveBeenCalledWith(next);
      });
    });

    describe("updating session", () => {
      const next = "test";
      let sendMessageSpy: jest.SpyInstance;

      beforeEach(() => {
        sendMessageSpy = jest.spyOn(BrowserApi, "sendMessage");

        sut.init();
      });

      it("should call stateService.setInSessionMemory and send message", async () => {
        await sut.updateSession(next);
        stateService.received(1).setInSessionMemory(key, next);
        expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        expect(sendMessageSpy).toHaveBeenCalledWith(key + "_update", { id: sut.id });
      });
    });

    describe("listening for updates", () => {
      let listenForUpdatesSpy: jest.SpyInstance;

      beforeEach(() => {
        listenForUpdatesSpy = jest.spyOn(BrowserApi, "messageListener").mockReturnValue();
        sut.init();
      });

      it("should set listener", () => {
        expect(listenForUpdatesSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("updateFromMessage", () => {
      const fromSession = "from session";
      let nextSpy: jest.SpyInstance;

      beforeEach(() => {
        stateService.getFromSessionMemory(key).resolves(fromSession);
        nextSpy = jest.spyOn(behaviorSubject, "next").mockReturnValue();
      });

      it("should ignore a message from itself", () => {
        sut.updateFromMessage({ id: sut.id });
        stateService.didNotReceive().getFromSessionMemory(Arg.any());
      });

      it("should set behavior subject next", async () => {
        await sut.updateFromMessage({ id: "different Id" });
        stateService.received(1).getFromSessionMemory(key);
        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(nextSpy).toHaveBeenCalledWith(fromSession);
      });
    });
  });

  describe("build from key value pair", () => {
    const key = "key";
    const initializer = (s: any) => "used initializer";
    class TestClass {}
    const ctor = TestClass;

    it("should call initializer if provided", () => {
      const actual = SessionSyncer.buildFromKeyValuePair(
        {},
        {
          key: key,
          initializer: initializer,
        }
      );

      expect(actual).toEqual("used initializer");
    });

    it("should call ctor if provided", () => {
      const expected = { provided: "value" };
      const actual = SessionSyncer.buildFromKeyValuePair(expected, {
        key: key,
        ctor: ctor,
      });

      expect(actual).toBeInstanceOf(ctor);
      expect(actual).toEqual(expect.objectContaining(expected));
    });

    it("should prefer using initializer if both are provided", () => {
      const actual = SessionSyncer.buildFromKeyValuePair(
        {},
        {
          key: key,
          initializer: initializer,
          ctor: ctor,
        }
      );

      expect(actual).toEqual("used initializer");
    });
  });
});
