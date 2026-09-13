import type { CardAbility } from '../ability/CardAbility';
import type { Card } from '../card/Card';

/**
 * The structural shape of a unit (leader or non-leader) card's piloting ability lists, reached only
 * through a structural capability check — never `isUnit()`, which is `false` for a pilot-attached card
 * (exactly the cards whose piloting abilities matter here; see `UnitProperties.isUnit()`).
 */
interface ICardWithPilotingAbilities {
    pilotingActionAbilities: readonly CardAbility[];
    pilotingTriggeredAbilities: readonly CardAbility[];
}

function hasPilotingAbilities(card: Card): card is Card & ICardWithPilotingAbilities {
    return 'pilotingActionAbilities' in card;
}

/**
 * The single shared definition of "the ability surface that can carry a serializable, limit-bearing
 * printed ability": printed action and triggered abilities, printed piloting action and triggered
 * abilities, and a base's epic action. Both `PristineAbilityIdentifiers` (the coordinate-drift guard) and
 * `AbilityLimitSerializer` (the limit walk) must derive from exactly this list — a card whose live ability
 * is on one side of the comparison and not the other trips the guard on every save of that card.
 *
 * Constant abilities are excluded: they carry no `AbilityLimit` (`ConstantAbility` does not extend
 * `CardAbility`), so they cannot appear here regardless of which list registered them.
 */
export function getLimitBearingAbilitySurface(card: Card): CardAbility[] {
    const abilities: CardAbility[] = [
        ...card.getPrintedActionAbilities(),
        ...card.getPrintedTriggeredAbilities(),
    ];

    if (hasPilotingAbilities(card)) {
        abilities.push(...card.pilotingActionAbilities, ...card.pilotingTriggeredAbilities);
    }

    if (card.isBase() && card.epicActionAbility) {
        abilities.push(card.epicActionAbility);
    }

    return abilities;
}
