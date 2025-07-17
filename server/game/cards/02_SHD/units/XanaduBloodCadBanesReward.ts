import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class XanaduBloodCadBanesReward extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5818136044',
            internalName: 'xanadu-blood#cad-banes-reward',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return another friendly non-leader Underworld unit to its owner’s hand. If you do, exhaust an enemy unit or resource',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Underworld),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: {
                title: 'Exhaust an enemy unit or resource',
                targetResolver: {
                    mode: TargetMode.Select,
                    choices: {
                        ['Exhaust an enemy resource']: AbilityHelper.immediateEffects.exhaustResources({ amount: 1 }),
                        ['Exhaust an enemy unit']: AbilityHelper.immediateEffects.selectCard({
                            controller: RelativePlayer.Opponent,
                            cardTypeFilter: WildcardCardType.Unit,
                            immediateEffect: AbilityHelper.immediateEffects.exhaust()
                        }),
                    }
                }
            }
        });
    }
}
