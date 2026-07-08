// Ambient augmentations for accounts-passwordless.
//
// zodern:types generates types for core atmosphere packages (accounts-base,
// meteor, email, …) but does not currently ship types for accounts-passwordless.
// The package adds three things at runtime that we need to type:
//   1. Accounts.emailTemplates.sendLoginToken  (server; email template config)
//   2. Accounts.requestLoginTokenForUser       (client; requests the code email)
//   3. Meteor.passwordlessLoginWithToken        (client; consumes the code)
//
// TypeScript merges this `declare module` block with the existing declarations
// in .meteor/local/build/.../accounts-base.d.ts and meteor.d.ts.

declare module 'meteor/accounts-base' {
  export interface EmailTemplates {
    sendLoginToken?: {
      from?: (user: Meteor.User) => string;
      subject?: (user: Meteor.User) => string;
      text?: (user: Meteor.User, url: string, params: { sequence: string }) => string;
      html?: (user: Meteor.User, url: string, params: { sequence: string }) => string;
    };
  }

  export namespace Accounts {
    function requestLoginTokenForUser(
      options: {
        selector: string | { email?: string; username?: string };
        userData?: Record<string, unknown>;
        codeLength?: number;
      },
      callback?: (error?: Meteor.Error) => void,
    ): void;
  }
}

declare module 'meteor/meteor' {
  export namespace Meteor {
    function passwordlessLoginWithToken(
      selector: { email?: string; username?: string } | string,
      code: string,
      callback?: (error?: Meteor.Error) => void,
    ): void;
  }
}
