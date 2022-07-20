import { Observable, Subscription } from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SyncedItemMetadata } from "./sync-item-metadata";

export class SessionSyncer {
  subscription: Subscription;
  id = Utils.newGuid();

  constructor(
    private observedObject: any,
    private stateService: StateService,
    private metaData: SyncedItemMetadata
  ) {
    if (!(observedObject instanceof Observable)) {
      throw new Error("observedObject must be an instance of Observable");
    }

    if (metaData.ctor == null && metaData.initializer == null) {
      throw new Error("ctor or initializer must be provided");
    }

    this.observe(observedObject);
    this.listen_for_updates(observedObject);
  }

  observe(observable: Observable<any>) {
    this.subscription = observable.subscribe(async (next) => {
      await this.updateSession(this.metaData.key, next);
    });
  }

  listen_for_updates(observable: Observable<any>) {
    // TODO MDG: message-based observing
  }

  async updateSession(key: string, value: any) {
    await this.stateService.setInSessionMemory(key, value);
    await BrowserApi.sendMessage(this.update_message, { id: this.id });
  }

  build_from_key_value_pair(key_value_pair: any) {
    if (this.metaData.initializer != null) {
      return this.metaData.initializer(key_value_pair);
    }
    return Object.create(
      this.metaData.ctor.prototype,
      Object.getOwnPropertyDescriptors(key_value_pair)
    );
  }

  private get update_message() {
    return `${this.metaData.key}_update`;
  }
}
