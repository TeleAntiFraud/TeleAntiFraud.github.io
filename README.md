# TeleAntiFraud.github.io

Static GitHub Pages site for the TeleAntiFraud Community.

## Structure

- `index.html`: landing page
- `publications.html`: publications and resource links
- `community.html`: placeholder page for members and collaborating institutions
- `assets/css/styles.css`: shared styles
- `assets/js/data.js`: editable publication/member/partner data
- `assets/js/site.js`: rendering logic

## Local preview

```bash
cd /Users/mzm/code/TeleAntiFraud.github.io
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages deployment

If you want this to be the organization homepage, create or use the repository:

`TeleAntiFraud/TeleAntiFraud.github.io`

Then copy these files into that repository and push to the default branch. GitHub Pages will serve it automatically as the organization site.
