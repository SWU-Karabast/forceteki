import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class PiercingShot extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6938023363',
            internalName: 'piercing-shot',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Defeat all Shield tokens on a unit. Deal 3 damage to that unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.defeat((context) => ({
                        target: context.target.upgrades.filter((u) => u.isShield())
                    })),
                    AbilityHelper.immediateEffects.damage({ amount: 3 })
                ])
            }
        });
    }
}

