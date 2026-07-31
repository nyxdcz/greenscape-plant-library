# Staff Access Code

The readable staff access code must never be committed to GitHub.

## Change the code

1. Duplicate `access-code.example.txt`.
2. Rename the copy to `access-code.txt`.
3. Replace the placeholder with the new 8–64 character code.
4. Double-click `tools/Update Staff Access Code.command`.
5. Wait for the Terminal success message.

The tool will:

- generate a new random salt
- create the SHA-256 hash used by the website
- update `assets/js/staff-access-config.js`
- update its browser cache key in `index.html`
- delete the readable `access-code.txt`
- run all website quality checks
- commit, push, and verify the live website only when every check passes

`staff-access/access-code.txt` is ignored by Git and must remain local.

## Security note

This is client-side access control on a static GitHub Pages website. It prevents ordinary unauthorized editing, but it is not a server-side authentication system for highly confidential data.
