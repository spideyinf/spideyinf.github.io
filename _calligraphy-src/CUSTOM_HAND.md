# Adding your own handwriting

In Daily Hand, a hand (a "script") has two parts. You can add either one or both:

| Part | What it drives | How you make it | Time |
|---|---|---|---|
| **Strokes** (`hand.json`) | Stroke-by-stroke tutorials and the letters you trace in ABC | Write each letter in the app's recorder | 30–60 min |
| **Font** (`font.woff2`) | Words, paragraphs, quotes, the letter grid | Scan a template with Calligraphr | about 1 hour |

With strokes only, text falls back to the Business cursive font. With a font only, ABC shows "No strokes recorded yet".

---

## 0. Settle your hand on paper first

The app can only be as consistent as the model you give it. Spend one session with the fountain pen you practise with:

1. Choose your proportions and keep them fixed:
   - **x-height:** the body of a, c, e, o. Pick one size for your nib.
   - **Ascenders and capitals:** about 2× the x-height (b, d, h, k, l, and A–Z).
   - **Descenders:** about 1× the x-height below the baseline (g, j, p, q, y).
   - **Slant:** measured from horizontal. Copperplate is 55°, most everyday hands are 55–65°, and upright is 90°.
2. Write every letter 5–10 times on guideline paper, then circle the best one of each. Choose for consistency with the other letters, not for beauty on its own.
3. For each letter, decide the stroke order and where the pen lifts. Each lift becomes one step of the tutorial.

---

## 1. Record the strokes (in the app)

Use a tablet with a stylus if you can (iPad and Apple Pencil). A phone and finger works, but less precisely.

1. Open **ABC → Record your hand**, or go to https://spideyinf.github.io/calligraphy/#/record
2. Under **Your hand**, set:
   - **Name**: what appears in the hand picker.
   - **Slant**: your slant from step 0. The guides on the writing card follow it.
   - **Shading**: how much downstrokes swell. 0 looks like a ballpoint, 0.3–0.5 like a fountain pen, 1 like a pointed pen.
3. For each letter, write it **once** on the card:
   - Lowercase bodies go between the baseline (bottom solid line) and the waistline (top solid line).
   - Capitals and ascenders reach the top dashed line. Descenders reach the bottom dashed line.
   - Write in teaching order. Each time you lift the pen is one tutorial step, numbered in red.
   - Use **Undo** for the last stroke and **Clear** to restart the letter.
   - Rename the steps below the card, e.g. "Oval", "Stem and exit". These names appear in the tutorial.
   - Tap **Keep, next letter**.
4. Your recording is saved on that device as you go, so you can spread it over several days. Recorded letters are shown in dark ink in the letter strip.
5. Tap **Try it in ABC** to try the recording straight away: it appears as "*Name* (draft)" in the hand picker on that device.
6. When you're happy, tap **Download hand.json**. Keep this file: the draft only lives in that one browser.

What the recorder saves: each stroke becomes a list of `[x, y]` points in x-height units, with the slant removed:

- `y = 0` is the baseline, `1` the waistline, about `2` the capital line, about `-1` the descender line.
- The app re-applies your slant and shading when it draws.
- You can edit `hand.json` by hand, e.g. to rename steps or nudge a point.

---

## 2. Make the font (Calligraphr)

[Calligraphr](https://www.calligraphr.com) turns a scanned template into a normal font file. The free plan is enough: 75 characters per font, 1 font in progress at a time, and 2 variants per character. Pro ($10 for one month) adds up to 600 characters and ligatures, which this app doesn't need.

1. **Make a template.** Sign up, go to **Templates**, and add the **Minimal English** set (A–Z, a–z, 0–9 and basic punctuation). Stay at or under 75 characters.
2. **Print it** at **100% / actual size**, not "fit to page", or your letters won't line up in the font. Use paper your fountain pen likes, so you get no feathering.
3. **Write each character** in its box with the same pen and ink you practise with:
   - Sit lowercase on the template's baseline, with the bodies reaching its x-height line.
   - Keep entry and exit strokes short and at the same height, so neighbouring letters meet when typed. The free plan can't join cursive letters contextually; touching is the best you'll get.
4. **Scan** at 300–600 dpi. A scanner app on your phone works if the light is even and the page is flat.
5. **Upload** it under **My Fonts → Upload Template**. Check every character, then clean marks and fix size or baseline under **Edit characters**.
6. **Build Font** and download the **TTF** (or OTF).
7. **Convert it to woff2** (smaller, made for the web):
   ```bash
   pip install fonttools brotli
   python -m fontTools.ttLib.woff2 compress MyHand.ttf     # writes MyHand.woff2
   ```
   You can skip this: the app also accepts `.ttf`, `.otf` and `.woff`.

Other ways to make the font:
- **iFontMaker** (iPad): draw glyphs directly with the Pencil.
- **FontForge** (free, desktop): full control, including joins and kerning, but a steeper learning curve.

---

## 3. Add it to the app

1. Create a folder named after your hand: lowercase, with dashes, e.g. `my-hand`. Put both files in it:
   ```
   _calligraphy-src/src/hands/my-hand/
     hand.json     ← from the recorder
     font.woff2    ← from Calligraphr; must match "font" in hand.json
   ```
   If your font file has another name or extension, change the `"font"` field in `hand.json` to match, e.g. `"font": "MyHand.ttf"`.
2. Check it locally:
   ```bash
   cd _calligraphy-src
   npm run dev
   ```
   - Home: your hand appears in **The hand you're learning**.
   - http://localhost:5173/calligraphy/#/ductus/my-hand shows every recorded letter at once, with stroke order. This is the quickest way to spot a stray stroke.
3. Publish it:
   ```bash
   npm run build
   cd .. && git add _calligraphy-src calligraphy && git commit -m "Add my hand" && git push
   ```
4. Once it's live, you can tap **Delete recording** in the recorder so the draft doesn't show twice.

No code changes are needed: the app finds every `src/hands/*/hand.json` and its font when it builds.

---

## Notes

- **Missing letters are fine.** The tutorial says the letter isn't recorded yet, and the trace rows are left blank for you to write freely.
- **Re-recording a letter of a published hand:** record it in the recorder, download, and copy that letter's entry (e.g. `"A": { "steps": [...] }`) into your `hand.json`.
- **Privacy:** once pushed, `hand.json` and the font are public, like the rest of the GitHub Pages site.
