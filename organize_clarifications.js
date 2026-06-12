const fs = require('fs');
const raw = fs.readFileSync('C:/Users/Anthony/Documents/GitHub/forceteki/swu_raw.md', 'utf8');

// Manual set assignments for Ryan Serrano Q&A (based on card lookups)
const manualAssignments = [
  ["Does 'exchange' allow", "GENERAL"],
  ["How should Max Rebo", "LAW"],
  ["timing of delayed effects vs triggering", "GENERAL"],
  ["What defines if an action can be resolved simultaneously", "GENERAL"],
  ["overwhelm has two defenders how is Overwhelm damage resolved if Queen Amidala", "SEC"],
  ["If multiple effects modify printed attributes", "GENERAL"],
  ["Choke on Aspirations", "LAW"],
  ["Does a triggered ability doubled by a delayed effect nest", "GENERAL"],
  ["When control is reverted immediately from a delayed effect expiring", "GENERAL"],
  ["Tear This Ship Apart", "LAW"],
  ["How are Credits intended to work", "GENERAL"],
  ["How does Fives interact with pilots", "TS26"],
  ["Does 'name a card' require an exact card name", "GENERAL"],
  ["Is there a rules gap for When Defeated triggers on tokens", "GENERAL"],
  ["Who is responsible for the damage from undeployed leader abilities", "GENERAL"],
  ["Should both effects in a single sentence written with an", "GENERAL"],
  ["When instructed to", "GENERAL"],
  ["If a card creates a token for an opponent", "GENERAL"],
  ["SEC Galen Erso names", "SEC"],
  ["Who is discarding when an opponent causes the discard", "GENERAL"],
  ["How does control of a token upgrade change", "GENERAL"],
  ["How do we handle Ambush triggered inside", "GENERAL"],
  ["Can Let's Talk capture", "SEC"],
  ["Can Excess damage rules language", "GENERAL"],
  ["Does \"First\" or \"Next\" apply differently if all damage was prevented", "GENERAL"],
  ["Do we fully resolve a modified play a card action before applying game state checks", "GENERAL"],
  ["timing of removing Traitorous", "SOR"],
  ["If Corvus When Played ability is doubled", "JTL"],
  ["If SEC Grievous is attacked", "SEC"],
  ["Can SEC Queen Amidala defeat a unit", "SEC"],
  ["timing of multiple conditional attribute modifiers", "GENERAL"],
  ["Does \"during their previous action\" mean", "GENERAL"],
  ["What counts as a cost", "GENERAL"],
  ["What happens with two Condemn upgrades", "GENERAL"],
  ["exact timing of a keyword being granted in a modified play", "GENERAL"],
  ["When is a conditional keyword checked", "GENERAL"],
  ["If a card under opponent's control becomes my leader", "GENERAL"],
  ["Does a granted leader status get suppressed", "GENERAL"],
  ["Does LOF Third Sister leader unit ability", "LOF"],
  ["What counts as \"other units\" when no unit is chosen", "GENERAL"],
  ["Does JTL Admiral Yularen ability apply", "JTL"],
  ["How do Clone and Size Matters Not interact", "LOF"],
  ["Previous clarifications indicated that cost discounts", "GENERAL"],
  ["What is a \"subtype\" and where is it defined", "GENERAL"],
  ["How does LOF Rey actually work", "LOF"],
  ["How much of pending trigger resolution can rely on Last Known Information", "GENERAL"],
  ["How flexible is the application of effects to changing card types", "GENERAL"],
  ["When does an action that creates a Modified Action begin nesting triggers", "GENERAL"],
  ["Can LOF Kylo Ren leader play an upgrade", "LOF"],
  ["temporarily granted Hidden keyword that is removed interact with LOF Dooku", "LOF"],
  ["Does Padme Amidala Leader unit trigger multiple times if Rey is drawn", "SEC"],
  ["Does SEC Sly Moore When Played ability apply", "SEC"],
  ["How does JTL Han Solo Leader deploy interact with Plot", "JTL"],
  ["Can deployed JTL Thrawn leader unit double SEC Arihnda Pryce", "JTL"],
  ["Does consecutive apply to 'turn' or to 'action' when passing", "GENERAL"],
  ["If JTL Lando uses his leader ability to play Brain Invaders", "JTL"],
  ["lasting effect of \"Attached unit can't be attacked this phase\" still protect the unit if the upgrade is defeated", "GENERAL"],
  ["If a lasting effect is created by another lasting effect expiring at the same timing", "GENERAL"],
  ["Is the text of Heroic Sacrifice all one modified action", "SOR"],
  ["What Happens to Captured Cards When a Player Is Eliminated in Twin Suns", "GENERAL"],
  ["Does SOR Luke Leader ability mean", "SOR"],
  ["How does Shadow Caster actually function", "JTL"],
  ["Further clarifications on Last Known Information behavior", "GENERAL"],
  ["Does SOR Falcon trigger", "SOR"],
  ["Must JTL Annihilator's ability discard", "JTL"],
  ["Does a replacement effect on a defeat count for abilities that check for defeat", "GENERAL"],
  ["How does defeating upgrades that are providing HP to a unit factor", "GENERAL"],
  ["Does \"and\" templating refer to sequential or simultaneous ability resolution", "GENERAL"],
  ["Should \"instead\" in rules text always be read as 'colloquial English'", "GENERAL"],
  ["Timing in Twin Suns of when an opponent is defeated vs the healing reward", "GENERAL"],
  ["What effect, if any, does Commandeer have when played on a unit you already control", "JTL"],
  ["Does Sneak Attack defeat a card it played as a unit that is no longer a unit at the start of regroup", "SOR"],
  ["Do triggered abilities resolve during attack steps or in between", "GENERAL"],
  ["What happens to a captured unit guarded by a pilot unit that becomes an upgrade without leaving play", "GENERAL"],
  ["How does Last Known Information interact with constant abilities of an upgrade", "GENERAL"],
  ["When \"same arena\" is referenced", "GENERAL"],
  ["Is there any rules text mitigating an infinite loop", "GENERAL"],
  ["For Each/Focus Fire simultaneously dealing damage", "JTL"],
  ["If a card that generated a trigger changes control before that trigger resolves", "GENERAL"],
  ["Is Annihilator based on LKI when choosing a Clone in play", "JTL"],
  ["Does a lasting effect update based on controller when the text refers to friendly units", "GENERAL"],
  ["How to handle lasting effects, delayed effects, and change of control interactions", "GENERAL"],
  ["Is a triggered ability with a '/' separating multiple triggering conditions", "GENERAL"],
  ["Based on the new upgrade eligibility restrictions rule 3.6.3.B hotfix", "GENERAL"],
  ["What is the eligibility criteria of a Pilot attached as an upgrade", "GENERAL"],
  ["changes to smuggle explicitly stating that it is always a modified action", "GENERAL"],
  ["Can A New Adventure on a pilot unit play the pilot as an upgrade", "SHD"],
  ["Does Red Leader discount for any friendly upgrade", "JTL"],
  ["Does sentinel granted by a triggered ability and then removed also turn off", "GENERAL"],
  ["What timing needs to be considered in 6.2.3.A Determine Costs", "GENERAL"],
  ["Does \"Starting Hand\" also mean \"Opening Hand\"", "GENERAL"],
  ["How does Piloting and Last Known Information interact", "GENERAL"],
  ["Is it the potential for multiple actions or the actual existence of multiple actions", "GENERAL"],
  ["What is done with a card that becomes no longer valid to play", "GENERAL"],
  ["If Caught In The Crossfire is played in Twin Suns", "TWI"],
  ["Does Lurking TIE Phantom take damage from indirect damage", "SHD"],
  ["Does Spare The Target on Unrefusable Offer work", "SHD"],
  ["exact timing of deployed leader unit Bossk's triggered ability", "SOR"],
];

function getSetForQuestion(title) {
  for (const [substr, set] of manualAssignments) {
    if (title.includes(substr)) return set;
  }
  return 'GENERAL';
}

// Parse Ryan Serrano Q&A
const ryanSection = raw.substring(
  raw.indexOf('## Rules clarifications from Ryan Serrano'),
  raw.indexOf('## Rules clarifications from the dev team')
);
const ryanQuestions = ryanSection.split(/\n(?=### Question:)/).filter(s => s.startsWith('### Question:'));

// Parse dev team section
const devSection = raw.substring(
  raw.indexOf('## Rules clarifications from the dev team collected from social media'),
  raw.indexOf('## Rules clarifications from FFG via Jonah')
);
const devSetMap = {
  'Legends of the Force': 'LOF',
  'Jump to Lightspeed': 'JTL',
  'Twilight of the Republic': 'TWI',
  'Shadows of the Galaxy': 'SHD',
  'Spark of Rebellion': 'SOR'
};
const devBySet = {};
const devParts = devSection.split(/\n### Set \d+ - /);
for (const part of devParts) {
  const firstLine = part.split('\n')[0].trim();
  const setId = devSetMap[firstLine];
  if (setId) {
    // Only top-level bullets (not indented screenshot sub-bullets)
    const entries = part.split('\n')
      .filter(l => l.startsWith('* [') && !l.includes('[Screenshot]'))
      .map(l => l.trim());
    devBySet[setId] = entries;
  }
}

// Parse FFG section
const ffgSection = raw.substring(
  raw.indexOf('## Rules clarifications from FFG via Jonah'),
  raw.indexOf('## "Unofficial" Rules explainers')
);
const ffgEntries = ffgSection.split('\n').filter(l => l.trim().startsWith('* [')).map(l => l.trim());

// Parse unofficial section
const unoffSection = raw.substring(
  raw.indexOf('## "Unofficial" Rules explainers'),
  raw.indexOf('## Commonly asked questions')
);
const unoffEntries = unoffSection.split('\n').filter(l => l.trim().startsWith('* [')).map(l => l.trim());

// Parse common section
const commonSection = raw.substring(raw.indexOf('## Commonly asked questions'));
const commonLines = commonSection.split('\n').slice(1);
const commonEntries = [];
let current = '';
for (const line of commonLines) {
  if (line.startsWith('* ')) {
    if (current) commonEntries.push(current.trim());
    current = line + '\n';
  } else if (line.startsWith('  * ') && current) {
    current += line + '\n';
  } else if (current && line.trim() && !line.startsWith('```')) {
    current += line + '\n';
  }
}
if (current.trim()) commonEntries.push(current.trim());

// Group Ryan Serrano by set
const ryanBySet = {};
for (const q of ryanQuestions) {
  const titleMatch = q.match(/^### Question: (.+)/);
  const title = titleMatch ? titleMatch[1] : '';
  const set = getSetForQuestion(title);
  if (!ryanBySet[set]) ryanBySet[set] = [];
  ryanBySet[set].push(q);
}

// Assign unofficial entries by card
const unoffBySet = {
  SHD: [],
  SOR: [],
  GENERAL: [],
};
for (const e of unoffEntries) {
  if (e.includes('Reinforcement Walker') || e.includes('Traitorous') && e.includes('Survivors') ||
      e.includes('Moff Gideon') || e.includes('Krayt Dragon') || e.includes('Lurking TIE Phantom')) {
    unoffBySet.SHD.push(e);
  } else if (e.includes('Superlaser Technician') || e.includes('For A Cause I Believe In') || e.includes('Chirrut')) {
    unoffBySet.SOR.push(e);
  } else {
    unoffBySet.GENERAL.push(e);
  }
}

// Assign common entries by card
const commonBySet = {
  GENERAL: [],
  SOR: [],
  SHD: [],
};
for (const e of commonEntries) {
  if (e.includes('Energy Conversion Lab')) {
    commonBySet.SOR.push(e);
  } else if (e.includes('Krayt Dragon') || e.includes('Lurking TIE Phantom') || e.includes('Chirrut')) {
    commonBySet.SHD.push(e);
  } else {
    commonBySet.GENERAL.push(e);
  }
}

// Build final output
const setOrder = ['GENERAL', 'SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'SEC', 'LAW', 'TS26'];
const setNames = {
  GENERAL: 'General (Non-Card-Specific)',
  SOR: 'Set 1: SOR — Spark of Rebellion (Block 0)',
  SHD: 'Set 2: SHD — Shadows of the Galaxy (Block 0)',
  TWI: 'Set 3: TWI — Twilight of the Republic (Block 0)',
  JTL: 'Set 4: JTL — Jump to Lightspeed (Block A)',
  LOF: 'Set 5: LOF — Legends of the Force (Block A)',
  SEC: 'Set 6: SEC — Shadows of the Empire Collective (Block A)',
  LAW: 'Set 7: LAW — Law and Order (Block B)',
  TS26: 'TS26 — Twin Suns (Eternal Non-Rotating)',
};

let output = '# SWU Rules Clarifications — Organized by Set\n\n';
const counts = {};

for (const set of setOrder) {
  const entries = [];
  if (ryanBySet[set]) entries.push(...ryanBySet[set]);
  if (devBySet[set]) entries.push(...devBySet[set]);
  if (ffgEntries.length && set === 'GENERAL') entries.push(...ffgEntries);
  if (unoffBySet[set]) entries.push(...unoffBySet[set]);
  if (commonBySet[set]) entries.push(...commonBySet[set]);

  counts[set] = entries.length;
  if (entries.length === 0) continue;

  output += '---\n\n';
  output += '## ' + setNames[set] + '\n\n';
  for (const e of entries) {
    output += e + '\n\n';
  }
}

fs.writeFileSync('C:/Users/Anthony/Documents/GitHub/forceteki/swu_clarifications_by_set.md', output);
console.log('Written. Counts per set:');
let total = 0;
for (const set of setOrder) {
  if (counts[set]) { console.log('  ' + set + ': ' + counts[set]); total += counts[set]; }
}
console.log('Total:', total);
