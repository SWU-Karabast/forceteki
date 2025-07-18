import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CalculatedLethality extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0302968596',
            internalName: 'calculated-lethality',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a non-leader unit that costs 3 or less',
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            then: (thenContext) => ({
                title: 'For each upgrade that was on that unit, give an Experience token to a friendly unit.',
                thenCondition: () => thenContext.events?.length > 0,
                immediateEffect: AbilityHelper.immediateEffects.distributeExperienceAmong({
                    amountToDistribute: thenContext.events[0].lastKnownInformation.upgrades.length,
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    canChooseNoTargets: false,
                })
            })
        });
    }
}
