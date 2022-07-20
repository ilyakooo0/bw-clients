import { BehaviorSubject, Subscription } from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SyncedItemMetadata } from "./sync-item-metadata";

export class SessionSyncer {
  subscription: Subscription;
  id = Utils.newGuid();

  // everyone gets the same initial values
  private ignore_next_update = true;

  constructor(
    private behaviorSubject: any,
    private stateService: StateService,
    private metaData: SyncedItemMetadata
  ) {
    if (!(behaviorSubject instanceof BehaviorSubject)) {
      throw new Error("behaviorSubject must be an instance of BehaviorSubject");
    }

    if (metaData.ctor == null && metaData.initializer == null) {
      throw new Error("ctor or initializer must be provided");
    }
  }

  init() {
    this.observe(this.behaviorSubject);
    this.listenForUpdates(this.behaviorSubject);
  }

  observe(behaviorSubject: BehaviorSubject<any>) {
    // TODO MDG: when to unsubscribe?
    this.subscription = behaviorSubject.subscribe(async (next) => {
      if (this.ignore_next_update) {
        this.ignore_next_update = false;
        return;
      }
      await this.updateSession(next);
    });
  }

  listenForUpdates(behaviorSubject: BehaviorSubject<any>) {
    // TODO MDG: How do we handle this async?
    BrowserApi.messageListener(
      this.update_message,
      async (message) => await this.updateFromMessage(message)
    );
  }

  async updateFromMessage(message: any) {
    // TODO MDG: use message sender instead of id?
    if (message.id === this.id) {
      return;
    }
    const key_value_pair = await this.stateService.getFromSessionMemory(this.metaData.key);
    const value = SessionSyncer.buildFromKeyValuePair(key_value_pair, this.metaData);
    this.ignore_next_update = true;
    this.behaviorSubject.next(value);
  }

  async updateSession(value: any) {
    await this.stateService.setInSessionMemory(this.metaData.key, value);
    await BrowserApi.sendMessage(this.update_message, { id: this.id });
  }

  static buildFromKeyValuePair(key_value_pair: any, metaData: SyncedItemMetadata) {
    if (metaData.initializer != null) {
      return metaData.initializer(key_value_pair);
    }
    return Object.create(metaData.ctor.prototype, Object.getOwnPropertyDescriptors(key_value_pair));
  }

  private get update_message() {
    return `${this.metaData.key}_update`;
  }
}
