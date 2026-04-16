import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class EmperorPalpatineAccordingToMyDesign extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'emperor-palpatine#according-to-my-design-id',
            internalName: 'emperor-palpatine#according-to-my-design',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Give Advantage tokens to an exhausted friendly unit for each other friendly unit',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.canBeExhausted() && card.exhausted,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                    amount: context.player.getArenaUnits({ otherThan: context.target }).length
                }))
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Give Advantage tokens to an exhausted friendly unit for each other friendly unit',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card.exhausted && card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                    amount: context.player.getArenaUnits({ otherThan: context.target }).length
                }))
            }
        });
    }
}
