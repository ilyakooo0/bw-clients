import { Observable } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";

import { SessionStorable } from "./session-storable";
import { SessionSyncer } from "./session-syncer";
import { SyncedItemMetadata } from "./sync-item-metadata";

/**
 * Mark the class as syning state across the browser session. This decorator finds {@link Observable} properties
 * marked with @sessionSync and syncs these values across the browser session.
 *
 * @param constructor
 * @returns A new constructor that extends the original one to add session syncing.
 */
export function browserSession<TCtor extends { new (...args: any[]): any }>(constructor: TCtor) {
  return class extends constructor implements SessionStorable {
    __syncedItemMetadata: SyncedItemMetadata[];
    __sessionSyncers: SessionSyncer[];

    constructor(...args: any[]) {
      super(args);

      // Require state service to be injected
      const stateService = args.find((arg) => arg instanceof StateService);
      if (!stateService) {
        throw new Error("StateService must be injected");
      }

      if (this.__syncedItemMetadata == null || !(this.__syncedItemMetadata instanceof Array)) {
        return;
      }

      this.__sessionSyncers = this.__syncedItemMetadata.map(
        (metadata) => new SessionSyncer(this.get_observable_from_key(metadata.key), stateService)
      );
    }

    get_observable_from_key(key: string): Observable<any> {
      const val = (this as any)[key];
      if (!(val instanceof Observable)) {
        throw new Error(`${key} is not an observable`);
      }
      return val;
    }
  };
}
