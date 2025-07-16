import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class NamelessTerror extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9702812601',
            internalName: 'nameless-terror',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust a Force unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Force),
                immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            },
        });

        registrar.addOnAttackAbility({
            title: 'Each enemy unit loses the Force trait for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.source.controller.opponent.getArenaUnits(),
                effect: AbilityHelper.ongoingEffects.loseTrait(Trait.Force),
            })),
        });
    }
}