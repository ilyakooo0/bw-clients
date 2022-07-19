import { Observable } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";

export class SessionSyncer {
  constructor(private observedObject: any, private stateService: StateService) {
    if (!(observedObject instanceof Observable)) {
      throw new Error("observedObject must be an instance of Observable");
    }
    this.observe(observedObject);
  }

  observe(observable: Observable<any>) {
    return;

    // // TODO MDG: message-based observing

    // this.observedObject;
    // val.subscribe((next) => {
    //   this.updateSession(key, next);
    // });
  }
  updateSession(key: string, value: any) {
    // TODO MDG: update session storage
  }
}
