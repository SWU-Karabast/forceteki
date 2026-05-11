/**
 * Group bases into "types" — sets of functionally-identical bases — for the
 * matchmaking-queue opponent filter. Two bases share a type iff they share
 * aspects, HP, and rules text; unique-named (rarer) bases each get their own
 * single-card type. The FE picks a type and sends its `baseIds` on the wire,
 * so the BE rule never has to reason about groupings — it just compares ids.
 */
function buildBaseTypes(baseNames) {
    const groups = new Map();

    for (const base of baseNames) {
        if (typeof base.hp !== 'number') {
            continue;
        }
        const aspects = base.aspects.length === 0 ? ['neutral'] : [...base.aspects].sort();
        const textKey = normalizeText(base.text);
        const groupKey = `${aspects.join('+')}::${base.hp}::${textKey}`;
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
                id: `unique_${only.id}`,
                label: `${only.name} - ${group.hp}hp`,
                aspects: group.aspects,
                hp: group.hp,
                set: only.set ?? null,
                baseIds: [only.id],
                representativeId: only.id,
            });
            continue;
        }

        const sorted = [...group.bases].sort((a, b) => a.name.localeCompare(b.name));
        types.push({
            id: `group_${slug(`${group.aspects.join('_')}_${group.hp}_${group.text || 'vanilla'}`)}`,
            label: labelForGroup(group),
            aspects: group.aspects,
            hp: group.hp,
            set: null,
            baseIds: sorted.map((b) => b.id),
            representativeId: sorted[0].id,
        });
    }

    types.sort((a, b) => a.label.localeCompare(b.label));
    return types;
}

// Explicit ID sets for the canonical "common" Force and Splash bases (one
// per aspect, two cards each — same aspect+hp+text on the printed card).
// Hardcoded so a rules-text reword in card data can't accidentally drop
// the "Force"/"Splash" label, and so rare/unique Force- or Splash-themed
// bases (which have their own distinct rules text and don't appear here)
// stay labelled by card name. New sets that release additional Force /
// Splash commons need their IDs added here.
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

function labelForGroup(group) {
    const aspectLabel = group.aspects.map(capitalizeWord).join(' / ');
    const hp = `${group.hp}hp`;
    if (group.text === '') {
        return `${aspectLabel} - Vanilla - ${hp}`;
    }
    if (group.bases.some((b) => FORCE_BASE_IDS.has(b.id))) {
        return `${aspectLabel} - Force - ${hp}`;
    }
    if (group.bases.some((b) => SPLASH_BASE_IDS.has(b.id))) {
        return `${aspectLabel} - Splash - ${hp}`;
    }
    return `${aspectLabel} - ${hp}`;
}

function capitalizeWord(value) {
    if (!value) {
        return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function slug(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

module.exports = { buildBaseTypes };
