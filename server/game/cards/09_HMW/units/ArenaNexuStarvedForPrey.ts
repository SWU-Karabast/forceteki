import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ArenaNexuStarvedForPrey extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'arena-nexu#starved-for-prey-id',
            internalName: 'arena-nexu#starved-for-prey',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Deal 3 damage to a friendly ${TextHelper.Trait.Creature} unit and ready this unit.`,
            optional: true,
            limit: AbilityHelper.limit.perRound(1),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Creature),
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ target: context.target, amount: 3 })),
                }),
                AbilityHelper.immediateEffects.ready((context) => ({ target: context.source })),
            ])
        });
    }
}