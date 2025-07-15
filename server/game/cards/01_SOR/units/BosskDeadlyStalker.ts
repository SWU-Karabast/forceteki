import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BosskDeadlyStalker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0052542605',
            internalName: 'bossk#deadly-stalker',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to a unit',
            when: {
                onCardPlayed: (event, context) => event.card.isEvent() && event.player === context.player
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
            }
        });
    }
}
