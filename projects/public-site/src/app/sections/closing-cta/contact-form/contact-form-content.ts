export interface ContactFormContent {
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly messageLabel: string;
  readonly messagePlaceholder: string;
  readonly submitLabel: string;
  readonly sendingLabel: string;
  readonly backLabel: string;
  readonly errors: {
    readonly emailRequired: string;
    readonly emailInvalid: string;
    readonly messageRequired: string;
  };
  readonly successMessage: string;
  readonly failureMessage: string;
}
