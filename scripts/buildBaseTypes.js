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
                hp: group.hp,
                set: only.set ?? null,
                baseIds: [only.id],
                representativeId: only.id,
            });
            continue;
        }

        const sorted = [...group.bases].sort((a, b) => a.name.localeCompare(b.name));
        const representativeId = sorted[0].id;
        types.push({
            id: representativeId,
            kind: classifyGroup(group),
            aspects: group.aspects,
            hp: group.hp,
            set: null,
            baseIds: sorted.map((b) => b.id),
            representativeId,
        });
    }

    types.sort((a, b) => {
        const aspectCmp = (a.aspects ?? []).join('+').localeCompare((b.aspects ?? []).join('+'));
        if (aspectCmp !== 0) {
            return aspectCmp;
        }
        if (a.hp !== b.hp) {
            return a.hp - b.hp;
        }
        return a.id.localeCompare(b.id);
    });
    return types;
}

// Hardcoded so a rules-text reword can't silently drop the kind tag. New
// sets that release additional Force / Splash commons need their IDs added.
const FORCE_BASE_IDS = new Set([
    'LOF_020', 'LOF_021', 'LOF_023', 'LOF_024',
    'LOF_026', 'LOF_027', 'LOF_029', 'LOF_030',
]);
const SPLASH_BASE_IDS = new Set([
    'LAW_020', 'LAW_021', 'LAW_022', 'LAW_024',
    'LAW_025', 'LAW_027', 'LAW_028', 'LAW_030',
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
