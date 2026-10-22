# Plant suggestions and corrections

The public **Add plant** and **Suggest a correction** actions send proposals to **nyxdcz@gmail.com** through FormSubmit. They do not save a new or edited record in the visitor's browser or automatically publish catalogue changes.

Add plant requires a common name, scientific name, existing catalogue category, and uploaded JPEG, PNG, or WebP image. Plant code, recorded sizes, and a reference link are optional. The correction form requires a value for every selected correction item and sends the original record and its ID for comparison. Unselected fields are disabled and excluded from the submission.

Images are checked for a matching file signature, supported type, and a maximum size of 10,000,000 bytes. Category choices use the same list as the catalogue. Whitespace-only values, unlisted categories, invalid reference protocols, and excessive field lengths are rejected before submission.

## Sending and email activation

The forms submit a native multipart POST to `https://formsubmit.co/nyxdcz@gmail.com` in a new tab. This sends the image as an attachment without opening Gmail or another email composer. FormSubmit's default verification remains enabled. The original form keeps its draft open while the sender completes any verification in the new tab.

The originating page cannot verify delivery. It tells the sender to finish in the service tab and never displays an unverified "email sent" message. The service's response and receipt in the recipient inbox are separate checks.

FormSubmit requests one-time email confirmation when first used with a recipient. The owner must confirm the activation email before delivery is considered configured. Check inbox and spam, then submit one identifiable plant suggestion and one correction, including a test image, and confirm both messages and their attachments arrive. Do not infer delivery from a local validation pass or the service accepting a request.

- [FormSubmit setup and activation](https://formsubmit.co/)
- [File upload and verification documentation](https://formsubmit.co/documentation)

## Review and publishing

Review the email against the botanical reference and photograph. Approved changes still follow the [shared plant-data instructions](../data/ADD_PLANTS_HERE/README.md). Email submission alone does not publish a record.

## Validation

Run `npm run quality`. The catalogue suite includes required-field, category, URL, image signature/type/size, selected-field, text limit, and recipient checks in `scripts/catalogue-submission.test.mjs`.

Browser checks should cover both entry buttons, all four Add plant requirements, image selection, category choices, correction selection, invalid input feedback, Escape/Close/Cancel focus return, mobile layout, and the service-tab handoff. A successful automated suite is not evidence of inbox delivery.
