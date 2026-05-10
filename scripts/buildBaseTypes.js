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
        const aspect = base.aspects[0] ?? 'neutral';
        const hp = base.hp;
        const textKey = (base.text || '').trim();
        const groupKey = `${aspect}::${hp}::${textKey}`;
        if (!groups.has(groupKey)) {
            groups.set(groupKey, {
                aspect,
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
            // A unique-named base gets its own category, labeled by the
            // card's name + HP, with an (R) suffix for rare-rarity prints
            // so players can spot them at a glance.
            const only = group.bases[0];
            const rarityTag = formatRaritySuffix(only.rarity);
            const hp = group.hp ? `${group.hp}hp` : '';
            const baseLabel = [only.name, hp].filter(Boolean).join(' - ');
            types.push({
                id: `unique_${only.id}`,
                label: rarityTag ? `${baseLabel} ${rarityTag}` : baseLabel,
                aspect: group.aspect,
                hp: group.hp,
                rarity: only.rarity ?? null,
                set: only.set ?? null,
                baseIds: [only.id],
                representativeId: only.id,
            });
            continue;
        }

        const label = labelForGroup(group);
        const sorted = [...group.bases].sort((a, b) => a.name.localeCompare(b.name));
        types.push({
            id: `group_${slug(`${group.aspect}_${group.hp}_${group.text || 'vanilla'}`)}`,
            label,
            aspect: group.aspect,
            hp: group.hp,
            rarity: null,
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
    const aspect = capitalizeWord(group.aspect);
    const hp = group.hp ? `${group.hp}hp` : '';
    const text = group.text || '';
    if (text === '') {
        // Vanilla bases — no rules text. The tag is "Vanilla" so when an
        // aspect icon is rendered alongside the label and the leading
        // aspect word is stripped, the FE still has a meaningful descriptor
        // (e.g. "Vanilla - 30hp") rather than just "30hp".
        return `${aspect} - Vanilla - ${hp}`;
    }
    if ((/force token/i).test(text) || (/force is with you/i).test(text)) {
        return `${aspect} - Force - ${hp}`;
    }
    if ((/aspect penalt/i).test(text)) {
        return `${aspect} - Splash - ${hp}`;
    }
    return `${aspect} - ${hp}`;
}

function formatRaritySuffix(rarityChar) {
    if (!rarityChar) {
        return '';
    }
    const upper = rarityChar.toUpperCase();
    if (upper === 'R' || upper === 'L' || upper === 'S') {
        return `(${upper})`;
    }
    return '';
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
