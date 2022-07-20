import { Component } from "@angular/core";

@Component({
  selector: "app-delete-account",
  templateUrl: "delete-account.component.html",
})
export class DeleteAccountComponent {
  showPassword: boolean;
  masterPassword: string;

  submit() {
    // eslint-disable-next-line no-console
    console.log("submit");
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
