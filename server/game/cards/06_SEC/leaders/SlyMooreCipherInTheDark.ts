import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class SlyMooreCipherInTheDark extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sly-moore#cipher-in-the-dark-id',
            internalName: 'sly-moore#cipher-in-the-dark',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'If there are 4 or more exhausted units in play, create a Spy token',
            cost: [abilityHelper.costs.exhaustSelf(), abilityHelper.costs.abilityActivationResourceCost(1)],
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.game.getArenaUnits({ condition: (card) => card.isUnit() && card.exhausted }).length >= 4,
                onTrue: abilityHelper.immediateEffects.createSpy(),
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 2 damage to an exhausted unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.exhausted,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}