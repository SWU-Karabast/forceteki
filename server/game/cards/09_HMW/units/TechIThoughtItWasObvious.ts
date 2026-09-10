import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TechIThoughtItWasObvious extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'tech#i-thought-it-was-obvious-id',
            internalName: 'tech#i-thought-it-was-obvious',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust a unit',
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    !event.willDefeat &&
                    event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            }
        });
    }
}