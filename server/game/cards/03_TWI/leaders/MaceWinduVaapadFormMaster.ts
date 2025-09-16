import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class MaceWinduVaapadFormMaster extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4628885755',
            internalName: 'mace-windu#vaapad-form-master',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 1 damage to a damaged enemy unit. Then, if it has 5 or more damage on it, deal 1 damage to it.',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.damage > 0,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 1 damage to it',
                ifYouDoCondition: (context) => context.target.isUnit() && context.target.isInPlay() && context.target.damage >= 5,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1, target: ifYouDoContext.target }),
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to each damaged enemy unit.',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                target: context.player.opponent.getArenaUnits({ condition: (card) => card.isUnit() && card.damage > 0 }),
                amount: 2
            })),
        });
    }
}
