import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AhsokaTanoTrustInTheForce extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3086126864',
            internalName: 'ahsoka-tano#trust-in-the-force',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'Choose a unit with less power than a friendly unit. It gets +2/+0 for this phase',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                activePromptTitle: (context) => `Give a unit with less than ${Math.max(...context.player.getArenaUnits().map((x) => x.getPower()))} power +2/+0 for this phase`,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card.getPower() < Math.max(...context.player.getArenaUnits().map((x) => x.getPower())),
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Give a unit with less power than this unit +2/+0 for this phase',
            optional: true,
            targetResolver: {
                activePromptTitle: (context) => `Give a unit with less than ${context.source.getPower()} power +2/+0 for this phase`,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card.getPower() < context.source.getPower(),
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            }
        });
    }
}
