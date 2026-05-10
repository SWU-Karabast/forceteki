/**
 * Group bases into "types" — sets of functionally-identical bases — used by
 * the matchmaking-queue opponent filter so that picking a "Vanilla 30hp
 * Aggression" type matches against any of the printed cards in that group.
 *
 * Two bases are the same type if they share aspect, HP, and rules text. Each
 * type carries:
 *   - id:      stable identifier (`<aspect>_<hp>_<textKey>` or `unique_<id>`)
 *   - label:   short human-friendly description ("Aggression - Force",
 *              "Vanilla Aggression 30hp", or the base's own name)
 *   - aspect, hp
 *   - baseIds: every set-code id that belongs to this type
 *   - representativeId: a baseId that can be used for thumbnail rendering
 */
function buildBaseTypes(baseNames) {
    const groups = new Map();

    for (const base of baseNames) {
        if (typeof base.hp !== 'number') {
            continue;
        }
        // Sorted multi-aspect key: a future multi-aspect base (e.g. an
        // 'aggression+cunning' base) groups separately from single-aspect
        // bases that share only one of its aspects.
        const aspects = base.aspects.length === 0 ? ['neutral'] : [...base.aspects].sort();
        const hp = base.hp;
        const textKey = (base.text || '').trim();
        const groupKey = `${aspects.join('+')}::${hp}::${textKey}`;
        if (!groups.has(groupKey)) {
            groups.set(groupKey, {
                aspects,
                hp,
                text: textKey,
                bases: [],
            });
        }
        groups.get(groupKey).bases.push(base);
    }

    const types = [];
    for (const [groupKey, group] of groups.entries()) {
        if (group.bases.length === 1) {
            const only = group.bases[0];
            const hp = group.hp ? `${group.hp}hp` : '';
            const baseLabel = [only.name, hp].filter(Boolean).join(' - ');
            types.push({
                id: `unique_${only.id}`,
                label: baseLabel,
                aspects: group.aspects,
                hp: group.hp,
                set: only.set ?? null,
                baseIds: [only.id],
                representativeId: only.id,
            });
            continue;
        }

        const label = labelForGroup(group);
        const sorted = [...group.bases].sort((a, b) => a.name.localeCompare(b.name));
        types.push({
            id: `group_${slug(`${group.aspects.join('_')}_${group.hp}_${group.text || 'vanilla'}`)}`,
            label,
            aspects: group.aspects,
            hp: group.hp,
            set: null,
            baseIds: sorted.map((b) => b.id),
            representativeId: sorted[0].id,
        });
        // groupKey is debug only; reference it to satisfy lint rules.
        void groupKey;
    }

    types.sort((a, b) => a.label.localeCompare(b.label));
    return types;
}

function labelForGroup(group) {
    const aspectLabel = group.aspects.map(capitalizeWord).join(' / ');
    const hp = group.hp ? `${group.hp}hp` : '';
    const text = group.text || '';
    if (text === '') {
        // Vanilla bases — no rules text. The tag is "Vanilla" so when an
        // aspect icon is rendered alongside the label and the leading
        // aspect word is stripped, the FE still has a meaningful descriptor
        // (e.g. "Vanilla - 30hp") rather than just "30hp".
        return `${aspectLabel} - Vanilla - ${hp}`;
    }
    if ((/force token/i).test(text) || (/force is with you/i).test(text)) {
        return `${aspectLabel} - Force - ${hp}`;
    }
    if ((/aspect penalt/i).test(text)) {
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
