import { SessionStorable } from "./session-storable";

// TODO MDG: look in to hooking on get/set of properties for sync

class BuildOptions<T> {
  ctor?: new (args: any[]) => T;
  initializer?: (key_value_pair: any) => T;
}

/**
 * A decorator used to indicate the Observable should be synced for this browser session across all contexts.
 * **Note** This decorator does nothing if the enclosing class is not decorated with @browserSession.
 * >**WARNING synced observable values are synced as key-value pairs, not full objects!**
 * @param buildOptions
 * Builders for the value, requires either a constructor (ctor) for your observable type or an
 * initializer function that takes a key value pair representation of the observable data
 * and returns your observable type.
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
