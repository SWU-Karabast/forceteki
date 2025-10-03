import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamagePreventionType, WildcardCardType } from '../../../core/Constants';

export default class FinnOnTheRun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7244268162',
            internalName: 'finn#on-the-run',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.unique,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                        type: AbilityType.DamagePrevention,
                        preventionType: DamagePreventionType.Reduce,
                        preventionAmount: 1
                    })
                })
            }
        });
    }
}
