// Builds open-questions.html: the things that are unknown or unclear for Twin Suns / Always Two, each next to
// the card(s) that raise it. Run: node build-open-questions.js   (needs test/json from `npm run get-cards`).
const fs = require('fs');
const path = require('path');

const CARD_DIR = path.join(__dirname, '..', '..', '..', 'test', 'json', 'Card');
const OUT = path.join(__dirname, 'open-questions.html');

const want = new Set();
const SECTIONS = [];

function item(section, title, cards, question, why, handling, answer) {
    cards.forEach((c) => want.add(c));
    section.items.push({ title, cards, question, why, handling, answer });
}
function section(id, title, intro) {
    const s = { id, title, intro, items: [] };
    SECTIONS.push(s);
    return s;
}

// ---------------------------------------------------------------------------------------------
const ENG = section('engine', 'Engine-level unknowns',
    'General behaviours the rules do not state. Each is decided and tested once in the engine tests (engine-test-notes.md); per-card notes on the cards below do not repeat them.');

item(ENG, 'Indirect damage and bases (Always Two only)',
    ['tactical-heavy-bomber', 'guerilla-soldier', 'torpedo-barrage'],
    'In Always Two, may the player who assigns indirect damage put more on a base than it can still take before reaching its health? If so, where does the excess go (it stays on the base)?',
    'The rules only cap damage assigned to units (a unit cannot be assigned more than its remaining HP). Nothing is said for bases. In Always Two a base can be damaged past its health without eliminating the player, so the question arises there. In Twin Suns a base at its health is eliminated, so it does not arise. It matters for cards that ask "if a base was damaged this way".',
    'Open for Always Two only. Tested once at engine level; no per-card questions or notes about it.');

item(ENG, '"You take the initiative" when the teammate takes it (Always Two)',
    ['premonition-of-doom', 'ziton-moj#black-sun-bully', 'grogu#yes-yes-yes', 'ezra-bridger#what-are-you-afraid-of', 'the-mandalorian#we-cant-keep-running'],
    'In Always Two the initiative is shared by the team. When your teammate takes the initiative, do triggers worded "when you take the initiative" (or "the next time you take the initiative") fire for you?',
    'The Doubles rules say both players have the initiative and that when one takes it neither can take it again, but not whether "you take" is personal. Cards worded "if you have the initiative" are a different case and are settled: the team\'s initiative counts for both teammates.',
    'Open. Tested once at engine level; no per-card question.');

item(ENG, '"Defeat a base" in Always Two',
    ['grand-moff-tarkin#tyrant-of-the-outer-rim'],
    'What does an ability that defeats a base actually do in Always Two? For example, is damage set equal to the base\'s health, and what happens to the player?',
    'The rules define a defeated base only as damage at or above its health. In Twin Suns that eliminates the player. In Always Two a base at its health does not eliminate the player, and the amount of damage an ability places is not published.',
    'Open for Always Two. Twin Suns is settled (elimination). Tested once at engine level.');

item(ENG, '"When you heal damage from your base" when a teammate does the healing',
    ['darth-sidious#move-against-the-jedi'],
    'In Always Two, if your teammate\'s card or ability heals damage from your base, does that count as you healing it?',
    '"You" is personal, but the heal happens to your own base. No ruling covers a heal of your base caused by a teammate\'s effect.',
    'Open for Always Two. Twin Suns: the heal of up to 5 for eliminating a player is real healing and triggers it for the damage actually healed.');

item(ENG, 'Replacing a teammate\'s attacker',
    ['asajj-ventress#death-from-above'],
    'When your teammate\'s unit is attacking a base, can you use Asajj from your own hand to replace the attacker? If so, who controls Asajj as the new attacker (and so deals the combat damage)?',
    '"Friendly" includes the teammate, so the trigger probably applies. But Asajj comes from your hand under your control and takes the place of a unit you cannot attack with, and no rule says who controls the unit put into play as the attacker.',
    'Open for Always Two. No per-card note on Asajj.');

item(ENG, 'What is left of an effect once it eliminates a player (Twin Suns)',
    ['operation-cinder', 'urgent-mission', 'lethal-crackdown', 'change-of-heart'],
    'If an effect eliminates a player partway through (for example Operation Cinder\'s 5 damage to your own base, then 5 damage to each unit), which of the remaining steps still happen?',
    'Cards the eliminated player owns are removed immediately and the rest of an effect that refers to those cards does not happen. It was not stated for the remaining steps that affect other players, such as Cinder\'s damage to each unit.',
    '',
    'Answered by R39 (2026-11-19): if an effect eliminates a player partway through, most of the rest of the effect that refers to that player\'s cards fizzles, because those cards are gone (Maul cannot take control of a unit of the player whose base his combat damage just finished). Cards are reviewed one by one for exceptions. For Operation Cinder the remaining "deal 5 damage to each unit" affects other players\' units, so it should still happen; that detail is my reading of R39. The four cards still carry the "Twin Suns: Elimination Unclear" tag.');

// ---------------------------------------------------------------------------------------------
const CARD = section('cards', 'Questions on specific cards',
    'Open items that belong to one card (or one pair of cards) and are not covered by an engine test.');

item(CARD, 'Ahsoka Tano, Always Ready for Trouble: is the opponent fixed?',
    ['ahsoka-tano#always-ready-for-trouble'],
    'Her constant ability depends on "an opponent" who has Ambush. Is the opponent chosen once and fixed, or checked against whichever opponent meets the condition as the board changes (Ambush gained or lost)?',
    'Your ruling is that only triggered abilities make a choice, and a constant ability applies while any one opponent meets the condition. It was not clear whether this card\'s condition ever needs a fixed opponent.',
    '',
    'It is a constant ability, active as long as any one opponent meets the criteria. No choice and no fixed opponent.');

item(CARD, 'Cad Bane, Hostage Taker: who draws on a rescue?',
    ['cad-bane#hostage-taker'],
    'If the defending player rescues the captured card, who draws the 2 cards: the defending player, or Cad Bane\'s controller?',
    'The text refers to "you" for Cad Bane\'s effect, but the rescue is done by another player. With several opponents the rescuer may not be the player who captured.',
    '',
    'Cad Bane\'s controller draws the 2 cards.');

item(CARD, 'Sly Moore, Witness to Power: elimination during a lasting effect',
    ['sly-moore#witness-to-power'],
    'If Sly Moore\'s controller is eliminated later in the phase, who counts as "an enemy unit" for the lasting effect, and does the effect continue?',
    'The effect lasts until the end of the phase, but the player it was relative to no longer exists.',
    '',
    'The effect remains the same as it was before the elimination.');

item(CARD, 'For a Cause I Believe In: one enemy base, or one per damage?',
    ['for-a-cause-i-believe-in'],
    'With several Heroism cards revealed, is the enemy base chosen once for all the damage, or can each 1 damage go to a different enemy base?',
    'The text says "for each Heroism card, deal 1 damage to an enemy base". It does not say whether the choice repeats.',
    '',
    'The total damage equals the number of Heroism cards revealed (up to 4), split among enemy bases as the player chooses: 4 to one base, 2 and 2, and so on. The Rules Unknown tag is removed.');

item(CARD, 'Give In to Your Anger: whose action satisfies the forced attack?',
    ['give-in-to-your-anger'],
    'If the teammate of the unit\'s controller takes the team\'s next action, does that satisfy the forced attack?',
    'Shared turns mean either teammate may take the team\'s action, but the card makes the unit\'s controller attack.',
    '',
    'The forced attack is the next action of the controller of the damaged unit; a teammate\'s action does not satisfy it.');

item(CARD, 'Evidence of the Crime and Pre Vizsla: a teammate\'s upgrade',
    ['evidence-of-the-crime', 'pre-vizsla#power-hungry'],
    'Can the upgrade chosen be one the teammate controls (or sits on the teammate\'s unit)? For Pre Vizsla, can it come from a non-Vehicle unit the teammate controls, or only from an enemy\'s?',
    'Neither card says "enemy" or "friendly" for the upgrade, so the unqualified-wording rule suggests any upgrade is legal, but the card-level questions were never answered.',
    '',
    'Yes. The upgrade can be one the teammate controls (for Pre Vizsla, from a non-Vehicle unit the teammate controls).');

item(CARD, 'Credit token: using a teammate\'s Credit',
    ['credit'],
    'May a player defeat their teammate\'s Credit token while paying for their own card, to pay 1 resource less?',
    'R23 already settles that a teammate\'s Credit tokens are friendly Credit tokens in every use: they are counted (Backed by the Hutts) and can be defeated as a cost or effect (Han Solo, Cad Bane). What is not covered is the token\'s own text ("while paying resources, you may defeat this token"), which pays part of a resource cost, the one thing a teammate\'s resources can never do.',
    '',
    'No.');

item(CARD, 'Darth Maul, Revenge at Last: two defenders from different players',
    ['darth-maul#revenge-at-last'],
    'Can Maul\'s two defenders be units controlled by two different opponents or enemies? If so, who is "the defending player" for the Overwhelm excess damage?',
    'The rules assume one defending player per attack.',
    '',
    'Yes.');

item(CARD, 'Impropriety Among Thieves: Always Two seating within a team',
    ['impropriety-among-thieves'],
    'In Always Two, which player on each team has their teammate on their right and which has an enemy? In other words, which seat does each player take within their team?',
    'R8 says "the player to their right" is taken from each player\'s own perspective, so for one player on each team it is the teammate and for the other an enemy. It also says which seat each player takes within their team is not yet defined, so the exact mapping of who takes whose unit cannot be fixed.',
    'Open. The card\'s notes describe the swap by each player\'s own right-hand neighbour; a scan for other seating-dependent cards is still to do.');

item(CARD, 'Let the Wookiee Win: attacking with a readied teammate Wookiee',
    ['let-the-wookiee-win'],
    'If the controller readies a friendly Wookiee unit that belongs to the teammate, may the controller attack with it?',
    'An attack is never initiated with a teammate\'s unit, but this card says "attack with it".',
    '',
    'Answered by the Hotshot Maneuver ruling (and applied to Fiery Alliance): a teammate\'s unit is a legal choice and gets readied, but the attack does not happen because you can never attack with a teammate\'s unit. That is my application of the earlier ruling to this card.');

item(CARD, 'Saw Gerrera, Extremist: an event whose cost eliminates the opponent',
    ['saw-gerrera#extremist'],
    'In Always Two, if the 2 damage an opponent must deal to their base to play an event brings that base to its health, does the event still resolve?',
    'Twin Suns is settled: the base is defeated, the opponent is eliminated and, per the official ruling, the event does not resolve. R10 settles that in Always Two the player can still pay the cost with a base at or past its health. What is not covered is whether the event resolves when the cost leaves an Always Two base at its health (defeated by definition, but the player is not eliminated).',
    '',
    'It can be done in Always Two.');

// ---------------------------------------------------------------------------------------------
const DEF = section('deferred', 'Deferred rulings and unconfirmed rules',
    'The "deferred rulings" lists in the rules file. Most turned out to have answers already; they are listed here with the answer. No single card, so no card images.');
const deferred = [
    ['Attacker takes control of the defender mid-attack \u2014 answered', 'Twin Suns: if the defender\'s controller changes to someone other than the attacker, the attack continues with the new controller as the defending player (Twin Suns combat rule).'],
    ['Controlled-not-owned cards on elimination \u2014 answered', 'R42: a card the eliminated player controls but does not own goes to its owner\'s discard pile; that move is not a defeat and not leaving play (except effects lasting "until it leaves play").'],
    ['Comparison cards ("most", "fewer than") \u2014 answered', 'R1, R2, R17, R18 and R40 cover comparisons: a static condition is true if any one opponent qualifies, comparisons over enemy units pool all opponents, and a resolved effect lets the controller choose the opponent.'],
    ['Whether an eliminated player can share a win \u2014 answered', 'Eliminated players are not players for any effect, so they cannot be among the players with the most base HP. Ties share the win among the remaining players.'],
    ['Seating and choice order, and base-at-0-HP edge cases \u2014 answered', 'R7 to R9 cover "the player to their right" and clockwise choice order; R10 and R28 cover a base at or past its health.'],
    ['Who collects a Bounty (R41) \u2014 your ruling, not officially confirmed', 'Always an opponent of the unit\'s controller; if the controller or their teammate defeats it, the defeating player chooses which opponent collects. Kept as your ruling, believed but not confirmed by an official source.'],
];

// ---------------------------------------------------------------------------------------------
const TAGS = section('tags', 'Tags that may be out of date',
    'Cards still tagged "Always Two: Rules Unknown" where the reason for the tag has since been answered or moved to the engine level. They can probably be cleared.');

item(TAGS, 'Pilots attaching to a teammate\'s Vehicle',
    ['l337#get-out-of-my-seat', 'poe-dameron#one-hell-of-a-pilot'],
    'Can L3-37 and Poe Dameron attach as a Pilot to a teammate\'s Vehicle?',
    'Settled: a Pilot can be played, deployed or attached onto a teammate\'s Vehicle; the player who plays it controls the upgrade, and anything it grants belongs to the Vehicle\'s controller.',
    'Tag can probably be removed.');

item(TAGS, 'Defeating a teammate\'s resource',
    ['enterprising-lackeys'],
    'Can the friendly resource it defeats be the teammate\'s?',
    'Settled: a friendly resource can be the teammate\'s (it just can never pay a cost).',
    'Tag can probably be removed.');

item(TAGS, 'Indirect damage on a base',
    ['decimator-of-dissidents', 'red-squadron-ywing', 'tie-bomber'],
    'Can indirect damage be over-assigned to a base?',
    'This is the engine-level question at the top of the page.',
    'Tag and card question can be dropped; covered once at engine level.');

// ---------------------------------------------------------------------------------------------
// Card data
const found = {};
for (const f of fs.readdirSync(CARD_DIR)) {
    let a;
    try { a = JSON.parse(fs.readFileSync(path.join(CARD_DIR, f), 'utf8')); } catch (e) { continue; }
    for (const c of (Array.isArray(a) ? a : (a.cards || [a]))) {
        if (want.has(c.internalName) && !found[c.internalName]) { found[c.internalName] = c; }
    }
}
const missing = [...want].filter((id) => !found[id]);
if (missing.length) { console.warn('missing card data:', missing.join(', ')); }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function cardBlock(id) {
    const c = found[id];
    if (!c) { return `<div class="card"><div class="noimg">${esc(id)}</div></div>`; }
    const num = c.setId && c.setId.number != null ? String(c.setId.number).padStart(3, '0') : '';
    const text = [c.text, c.deployBox].filter(Boolean).join(' // ').replace(/<[^>]+>/g, '').replace(/\n/g, ' ');
    const name = c.title + (c.subtitle ? ' — ' + c.subtitle : '');
    const hasImg = num && c.setId && c.setId.set && !Number.isNaN(parseInt(num, 10));
    return `<figure class="card"><div class="imgslot"${hasImg ? ` data-set="${esc(c.setId.set)}" data-num="${esc(num)}"` : ''}><img alt="${esc(name)}" referrerpolicy="no-referrer" hidden><div class="noimg"${hasImg ? ' hidden' : ''}>${esc(name)}</div></div><figcaption><b>${esc(name)}</b><span>${esc(text)}</span></figcaption></figure>`;
}
function renderItem(it, n) {
    const tail = it.answer
        ? `<p class="ans"><b>Answered</b> ${esc(it.answer)}</p>`
        : `<p><b>How we are handling it</b> ${esc(it.handling)}</p>`;
    return `<article class="item${it.answer ? ' answered' : ''}">
  <div class="cards">${it.cards.map(cardBlock).join('')}</div>
  <div class="body">
    <h3>${n}. ${esc(it.title)}${it.answer ? ' <span class="badge">answered</span>' : ''}</h3>
    <p class="q"><b>The question</b> ${esc(it.question)}</p>
    <p><b>Why it was unclear</b> ${esc(it.why)}</p>
    ${tail}
  </div>
</article>`;
}
let counter = 0;
const body = SECTIONS.filter((s) => !['deferred', 'tags'].includes(s.id)).map((s) => {
    s.items = s.items.filter((it) => !it.answer);
    if (s.id === 'deferred') {
        return `<section id="${s.id}"><h2>${esc(s.title)}</h2><p class="intro">${esc(s.intro)}</p><ul class="plain">${deferred.map(([t, d]) => `<li><b>${esc(t)}</b> ${esc(d)}</li>`).join('')}</ul></section>`;
    }
    return `<section id="${s.id}"><h2>${esc(s.title)}</h2><p class="intro">${esc(s.intro)}</p>${s.items.map((it) => renderItem(it, ++counter)).join('')}</section>`;
}).join('\n');

const toc = SECTIONS.filter((s) => !['deferred', 'tags'].includes(s.id)).map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Twin Suns and Always Two: open questions</title>
<style>
:root { --bg:#fafaf7; --panel:#ffffff; --text:#1d1d1b; --muted:#66665f; --line:#dcdcd2; --accent:#2f5fb0; }
@media (prefers-color-scheme: dark) { :root { --bg:#161718; --panel:#1f2123; --text:#e8e8e3; --muted:#9a9a92; --line:#33363a; --accent:#7ba4e6; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--text); font:16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width:1100px; margin:0 auto; padding:24px 16px 64px; }
h1 { font-size:26px; margin:0 0 6px; }
h2 { font-size:20px; margin:40px 0 4px; padding-top:8px; border-top:1px solid var(--line); }
h3 { font-size:17px; margin:0 0 8px; }
.sub, .intro { color:var(--muted); margin:0 0 16px; }
nav { display:flex; flex-wrap:wrap; gap:8px 16px; margin:12px 0 8px; }
nav a { color:var(--accent); }
.item { display:grid; grid-template-columns:minmax(150px, 360px) 1fr; gap:20px; background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px; margin:14px 0; }
.cards { display:flex; flex-wrap:wrap; gap:12px; align-content:flex-start; }
.card { margin:0; width:150px; }
.imgslot img { width:100%; border-radius:8px; display:block; }
.noimg { border:1px dashed var(--line); border-radius:8px; padding:20px 8px; text-align:center; color:var(--muted); font-size:13px; }
figcaption { font-size:12px; color:var(--muted); margin-top:4px; }
figcaption b { display:block; color:var(--text); font-size:13px; }
figcaption span { display:block; max-height:6.6em; overflow:auto; }
.body p { margin:0 0 10px; }
.body b { display:block; font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); }
.q { font-size:16px; }
.badge { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; color:#1f7a3d; border:1px solid currentColor; border-radius:999px; padding:1px 8px; vertical-align:middle; }
.answered { opacity:.9; }
.ans b { color:#1f7a3d; }
@media (prefers-color-scheme: dark) { .badge, .ans b { color:#6fcf8f; } }
.plain { padding-left:20px; }
.plain li { margin:10px 0; }
@media (max-width:720px) { .item { grid-template-columns:1fr; } .card { width:132px; } }
</style>
</head>
<body>
<main>
<h1>Twin Suns and Always Two: what is still unknown</h1>
<p class="sub">Generated from the review notes. Each entry sits next to the card or cards that raise it.</p>
<nav>${toc}</nav>
${body}
</main>
<script>
// Card images come from SWUDB; names vary, so several candidates are tried and the first that loads is shown.
for (const slot of document.querySelectorAll('.imgslot[data-set]')) {
  const set = slot.dataset.set, num = slot.dataset.num, bare = String(parseInt(num, 10));
  const urls = [...new Set([num, bare, bare.padStart(2, '0')])].map((n) => 'https://swudb.com/images/cards/' + set + '/' + n + '.png');
  const img = slot.querySelector('img'), miss = slot.querySelector('.noimg');
  const next = (i) => {
    if (i >= urls.length) { miss.hidden = false; return; }
    const p = new Image();
    p.referrerPolicy = 'no-referrer';
    p.onload = () => { img.src = urls[i]; img.hidden = false; };
    p.onerror = () => next(i + 1);
    p.src = urls[i];
  };
  next(0);
}
</script>
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('wrote', OUT, SECTIONS.reduce((n, s) => n + s.items.length, 0) + ' items,', deferred.length + ' deferred');
