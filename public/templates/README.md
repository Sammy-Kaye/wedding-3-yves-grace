# PDF Invitation Templates

This folder holds the two blank invitation PDFs used by the admin PDF
generation feature. Drop the files here, commit, push to GitHub, and
Netlify will redeploy. The admin "Generate Invitations" button then
becomes functional.

## Required files

| Filename | Purpose |
|---|---|
| `invitation-fr.pdf` | French invitation template |
| `invitation-en.pdf` | English invitation template |

## Template requirements

Each template **must** contain two placeholder markers typed exactly:

- `{{NAME}}` — where the guest's full name will go
- `{{CODE}}` — where their 6-character invite code will go

Type them in the font, size, and colour you want the final personalised
text to appear in. The generator replaces these markers with the real
values, matching the position you typed them at.

### Notes

- Only the first occurrence of each marker is used. Don't include them
  more than once.
- Markers don't need any extra formatting (no brackets in another font,
  no leading spaces). The exact strings `{{NAME}}` and `{{CODE}}` are
  what the generator looks for.
- Single-page PDFs only. Multi-page templates aren't supported in v1.
- A4 or US Letter both work — page size is preserved.

Once both files are in place, open `/admin`, click "Generate Invitations",
and the language buttons will stop showing "Template missing".
