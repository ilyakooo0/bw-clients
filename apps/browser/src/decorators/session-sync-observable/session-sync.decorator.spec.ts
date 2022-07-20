import { Observable } from "rxjs";

import { sessionSync } from "./session-sync.decorator";

describe("sessionSync decorator", () => {
  const initializer = (s: string) => "test";
  const ctor = String;
  class TestClass {
    @sessionSync({ ctor: ctor, initializer: initializer })
    testProperty = new Observable<string>();
  }

  it("should add __syncedItemKeys to prototype", () => {
    const testClass = new TestClass();
    expect((testClass as any).__syncedItemMetadata).toEqual([
      expect.objectContaining({
        key: "testProperty",
        ctor: ctor,
        initializer: initializer,
      }),
    ]);
  });
});
