import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";

import { StateService } from "../../services/abstractions/state.service";

import { SessionStorable } from "./session-storable";
import { SessionSyncer } from "./session-syncer";
import { SyncedItemMetadata } from "./sync-item-metadata";

/**
 * Mark the class as syncing state across the browser session. This decorator finds rxjs BehaviorSubject properties
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
      const messagingService = args.find((arg) => arg instanceof MessagingService);
      if (!stateService || !messagingService) {
        throw new Error(
          `Cannot decorate ${constructor.name} with browserSession, StateService and MessagingService must be injected`
        );
      }

      if (this.__syncedItemMetadata == null || !(this.__syncedItemMetadata instanceof Array)) {
        return;
      }

      this.__sessionSyncers = this.__syncedItemMetadata.map(
        (metadata) =>
          new SessionSyncer((this as any)[metadata.key], stateService, messagingService, {
            key: `${constructor.name}_` + metadata.key,
            ctor: metadata.ctor,
            initializer: metadata.initializer,
          })
      );
    }
  };
}
