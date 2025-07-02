import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class FocusFire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8905858173',
            internalName: 'focus-fire',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Choose a unit. Each friendly Vehicle unit in the same arena deals damage equal to its power that unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => (this.getDamageFromContext(context))),
            }
        });
    }

    private getDamageFromContext(context: AbilityContext) {
        const arenaName = context.target.zoneName;
        const friendlyVehicleUnits = context.player.getArenaUnits({ arena: arenaName, condition: (card) => card.isUnit(), trait: Trait.Vehicle }).filter((unit) => unit.isUnit() && unit.hasSomeTrait(Trait.Vehicle));
        const damageEffects = [];
        friendlyVehicleUnits.forEach((unit) => {
            const damageEffect = AbilityHelper.immediateEffects.damage({ target: context.target, amount: unit.getPower(), source: unit });
            damageEffects.push(damageEffect);
        });
        return damageEffects;
    }
}
