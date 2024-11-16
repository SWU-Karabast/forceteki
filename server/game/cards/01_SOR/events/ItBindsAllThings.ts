import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

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
                controller: RelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                canDistributeLess: true,
                maxTargets: 1,
            }),
            then: (thenContext) => ({
                title: 'If you control a FORCE unit, you may deal that much damage to another unit.',
                targetResolver: {
                    optional: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => thenContext.source.controller.isTraitInPlay(Trait.Force) &&
                      card !== thenContext.events[0].card && thenContext.events[0].damageRemoved > 0,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: thenContext.events[0].damageRemoved }),
                }
            })
        });
    }
}

ItBindsAllThings.implemented = true;
