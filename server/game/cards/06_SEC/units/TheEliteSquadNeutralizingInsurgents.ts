import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TheEliteSquadNeutralizingInsurgents extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-elite-squad#neutralizing-insurgents-id',
            internalName: 'the-elite-squad#neutralizing-insurgents',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to a unique unit',
            when: {
                whenPlayed: true,
                onDamageDealt: (event, context) => event.card === context.source,
            },
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source && card.unique,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}