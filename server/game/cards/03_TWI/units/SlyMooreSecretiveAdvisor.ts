import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, PhaseName, RelativePlayer } from '../../../core/Constants';

export default class SlyMooreSecretiveAdvisor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7732981122',
            internalName: 'sly-moore#secretive-advisor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Take control of an enemy token unit and ready it. At the start of the regroup phase, that token unit\'s owner takes control of it.',
            targetResolver: {
                cardTypeFilter: CardType.TokenUnit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        newController: context.player
                    })),
                    AbilityHelper.immediateEffects.ready((context) => ({
                        target: context.target
                    })),
                    AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                        title: 'Owner takes control',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                            newController: context.target.owner
                        })
                    }))
                ])
            }
        });
    }
}
