import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class C3POHumanCyborgRelations extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'c3po#humancyborg-relations-id',
            internalName: 'c3po#humancyborg-relations',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Exhaust a unit',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.canBeExhausted() && card.exhausted }),
                    onTrue: abilityHelper.immediateEffects.exhaust()
                })
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card !== context.source && card.canBeExhausted() && card.exhausted }),
                    onTrue: abilityHelper.immediateEffects.exhaust()
                })
            },
        });
    }
}