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

// The four canonical "common" Force bases (one per aspect) all share this
// exact rules text, as do the four canonical "common" Splash bases. Matching
// the whole text (case- and whitespace-normalised) classifies only the
// canonical commons; rare/unique Force- or Splash-themed bases have their
// own distinct text and get their own single-base group with a card-name
// label instead of being mis-labelled "Force"/"Splash".
const CANONICAL_FORCE_TEXT = 'when a friendly force unit attacks: the force is with you (create your force token).';
const CANONICAL_SPLASH_TEXT = 'epic action: play a card from your hand, ignoring 1 of its vigilance, command, aggression, or cunning aspect penalties.';

function normalizeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim()
        .toLowerCase();
}

function labelForGroup(group) {
    const aspectLabel = group.aspects.map(capitalizeWord).join(' / ');
    const hp = `${group.hp}hp`;
    // group.text was normalised in buildBaseTypes — no need to re-normalise.
    if (group.text === '') {
        return `${aspectLabel} - Vanilla - ${hp}`;
    }
    if (group.text === CANONICAL_FORCE_TEXT) {
        return `${aspectLabel} - Force - ${hp}`;
    }
    if (group.text === CANONICAL_SPLASH_TEXT) {
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
