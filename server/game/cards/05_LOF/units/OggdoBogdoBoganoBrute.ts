import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class OggdoBogdoBoganoBrute extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2508430135',
            internalName: 'oggdo-bogdo#bogano-brute'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit can\'t attack unless it\'s damaged',
            condition: (context) => context.source.damage === 0,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Attack),
        });

        registrar.addTriggeredAbility({
            title: 'Heal 2 damage from this unit',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker &&
                    DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.source }))
        });
    }
}
