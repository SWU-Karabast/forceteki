import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class RishLooTraitorousMinister extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'rish-loo#traitorous-minister-id',
            internalName: 'rish-loo#traitorous-minister',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Take control of a non-leader unit with a Weakness token on it. At the start of the next regroup phase, its owner takes control of it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.hasWeakness(),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        newController: context.player,
                    })),
                    AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                        title: 'Owner takes control',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                            newController: context.target.owner,
                            excludeLeaderUnit: false,
                        })
                    }))
                ])
            }
        });
    }
}