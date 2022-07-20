import { SessionStorable } from "./session-storable";

// TODO MDG: look in to hooking on get/set of properties for sync

class BuildOptions<T> {
  ctor?: new (args: any[]) => T;
  initializer?: (key_value_pair: any) => T;
}

/**
 * A decorator used to indicate the BehaviorSubject should be synced for this browser session across all contexts.
 * **Note** This decorator does nothing if the enclosing class is not decorated with @browserSession.
 * @param buildOptions
 * Builders for the value, requires either a constructor (ctor) for your BehaviorSubject type or an
 * initializer function that takes a key value pair representation of the BehaviorSubject data
 * and returns your BehaviorSubject data type.
 * @returns decorator function
 */
export function sessionSync<T>(buildOptions: BuildOptions<T>) {
  return (prototype: unknown, propertyKey: string) => {
    const p = prototype as SessionStorable;

    if (p.__syncedItemMetadata == null) {
      p.__syncedItemMetadata = [];
    }

    p.__syncedItemMetadata.push({
      key: propertyKey,
      ctor: buildOptions.ctor,
      initializer: buildOptions.initializer,
    });
  };
}
