import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class ItBindsAllThings extends EventCard {
    protected override getImplementationId () {
        return {
            id: '0867878280',
            internalName: 'it-binds-all-things',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Heal up to 3 damage from a unit.',
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 3,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1,
            }),
            then: (thenContext) => ({
                title: 'If you control a Force unit, you may deal that much damage to another unit.',
                optional: true,
                thenCondition: () => thenContext.source.controller.isTraitInPlay(Trait.Force) &&
                  thenContext.events[0].totalDistributed > 0,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card !== thenContext.events[0].card,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: thenContext.events[0].totalDistributed }),
                }
            })
        });
    }
}

ItBindsAllThings.implemented = true;
