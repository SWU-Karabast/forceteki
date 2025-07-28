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
            ifYouDo: (ifYouDoContext) => {
                const upgradeCount = ifYouDoContext.target.isInPlay()
                    ? ifYouDoContext.target.upgrades.length
                    : ifYouDoContext.events[0].lastKnownInformation.upgrades.length;

                return {
                    title: 'For each upgrade that was on that unit, give an Experience token to a friendly unit.',
                    immediateEffect: AbilityHelper.immediateEffects.distributeExperienceAmong({
                        amountToDistribute: upgradeCount,
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                        canChooseNoTargets: false,
                    })
                };
            }
        });
    }
}
