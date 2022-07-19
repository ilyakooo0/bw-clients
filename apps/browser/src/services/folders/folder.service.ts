import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { FolderService as BaseFolderService } from "@bitwarden/common/services/folder/folder.service";

import { browserSession } from "src/decorators/session-sync-observable.decorator";

@browserSession
export class FolderService extends BaseFolderService {
  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    cipherService: CipherService,
    stateService: StateService,
    broadcasterService: BroadcasterService
  ) {
    super(cryptoService, i18nService, cipherService, stateService, broadcasterService);
  }
}
