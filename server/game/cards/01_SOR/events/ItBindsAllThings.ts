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
                maxTargets: 1,
            }),
            then: (thenContext) => ({
                title: 'If you control a Force unit, you may deal that much damage to another unit.',
                optional: true,
                thenCondition: () => thenContext.source.controller.isTraitInPlay(Trait.Force) &&
                  thenContext.events[0].damageRemoved > 0,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card !== thenContext.events[0].card,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: thenContext.events[0].damageRemoved }),
                }
            })
        });
    }
}

ItBindsAllThings.implemented = true;
