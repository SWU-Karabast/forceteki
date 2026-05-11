/**
 * Group bases into "types" — sets of functionally-identical bases — for the
 * matchmaking-queue opponent filter. Two bases share a type iff they share
 * aspects, HP, and rules text; otherwise each base is its own single-card
 * type. The FE picks a type and sends its `baseIds` on the wire, so the BE
 * rule just compares ids.
 */
function buildBaseTypes(baseNames) {
    const groups = new Map();

    for (const base of baseNames) {
        if (typeof base.hp !== 'number') {
            continue;
        }
        const aspects = base.aspects.length === 0 ? null : [...base.aspects].sort();
        const textKey = normalizeText(base.text);
        const groupKey = `${aspects ? aspects.join('+') : ''}::${base.hp}::${textKey}`;
        if (!groups.has(groupKey)) {
            groups.set(groupKey, { aspects, hp: base.hp, text: textKey, bases: [] });
        }
        groups.get(groupKey).bases.push(base);
    }

    const types = [];
    for (const group of groups.values()) {
        if (group.bases.length === 1) {
            const only = group.bases[0];
            types.push({
                id: only.id,
                kind: 'unique',
                name: only.name,
                aspects: group.aspects,
                baseIds: [only.id],
            });
            continue;
        }

        const sorted = [...group.bases].sort((a, b) => a.name.localeCompare(b.name));
        types.push({
            id: sorted[0].id,
            kind: classifyGroup(group),
            aspects: group.aspects,
            baseIds: sorted.map((b) => b.id),
        });
    }

    types.sort((a, b) => {
        const aspectCmp = (a.aspects ?? []).join('+').localeCompare((b.aspects ?? []).join('+'));
        if (aspectCmp !== 0) {
            return aspectCmp;
        }
        return a.id.localeCompare(b.id);
    });
    return types;
}

// "Force" and "Splash" are two recurring archetypes of common base in SWU,
// each printed once in every aspect (Aggression, Command, Cunning,
// Vigilance). We tag them by id rather than by rules-text match, since
// upstream text can drift (capitalisation, punctuation, wording edits).
//
// One representative id per aspect is enough: identical printings of the
// same archetype share aspect + hp + rules text, so the grouping step
// above bundles them together, and matching any one of the group's ids
// classifies the whole group.
//
// When a new set releases another Force or Splash common, add its id here.
const FORCE_BASE_IDS = new Set([
    'LOF_020', // Vigilance
    'LOF_023', // Command
    'LOF_026', // Aggression
    'LOF_029', // Cunning
]);
const SPLASH_BASE_IDS = new Set([
    'LAW_020', // Vigilance
    'LAW_022', // Command
    'LAW_025', // Aggression
    'LAW_028', // Cunning
]);

function normalizeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim()
        .toLowerCase();
}

function classifyGroup(group) {
    if (group.text === '') {
        return 'standard';
    }
    if (group.bases.some((b) => FORCE_BASE_IDS.has(b.id))) {
        return 'force';
    }
    if (group.bases.some((b) => SPLASH_BASE_IDS.has(b.id))) {
        return 'splash';
    }
    // Multi-card group with unrecognised text — doesn't fire on current data.
    return 'unknown';
}

module.exports = { buildBaseTypes };
