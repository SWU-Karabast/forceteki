import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
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
            then: (thenContext) => {
                const upgradeCount = thenContext.target ? this.upgradeCountWhenDefeated(thenContext.target) : 0;

                return {
                    title: 'For each upgrade that was on that unit, give an Experience token to a friendly unit.',
                    thenCondition: () => thenContext.target,
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

    /**
     * How many upgrades the target had when it left play, or has now if it survived the defeat (for
     * example Lurking TIE Phantom). The getter resolves both cases, so no branch is needed here.
     */
    private upgradeCountWhenDefeated(target: Card): number {
        const unit = this.gameState.getPropertiesOrLki(target);
        return unit.isUnit() && unit.isInPlay() ? unit.upgrades.length : 0;
    }
}
