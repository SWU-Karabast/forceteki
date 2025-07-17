import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class WatchThis extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8765982385',
            internalName: 'watch-this',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Return a non-leader unit that costs 6 or less to its owner\'s hand. Exhaust each other enemy unit in the same arena',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.hasCost() && card.cost <= 6,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.returnToHand(),
                    AbilityHelper.immediateEffects.exhaust((context) => ({
                        target: context.player.opponent.getArenaUnits({ arena: context.target.zoneName, otherThan: context.target })
                    }))
                ])
            }
        });
    }
}

