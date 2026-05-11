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

// One representative id per (kind, aspect). A group's other commons share
// aspect+hp+text with the representative and group together, so matching any
// member is enough to classify the whole group. Hardcoded ids — not a text
// match — so a rules-text reword can't silently drop the kind tag.
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
