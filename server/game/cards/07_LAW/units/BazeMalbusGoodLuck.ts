import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BazeMalbusGoodLuck extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9992505137',
            internalName: 'baze-malbus#good-luck'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal that much damage to a unit',
            optional: true,
            when: {
                onDamageHealed: (event, context) => event.card === context.source && event.amount >= 1
            },
            targetResolver: {
                activePromptTitle: (context) => `Deal ${context.event.amount} damage to a unit`,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: context.event.amount }))
            }
        });
    }
}