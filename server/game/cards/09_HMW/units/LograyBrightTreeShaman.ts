import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class LograyBrightTreeShaman extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'logray#bright-tree-shaman-id',
            internalName: 'logray#bright-tree-shaman',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a enemy unit',
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    event.card.isUnit() &&
                    event.card !== context.source &&
                    event.card.controller === context.player &&
                    event.card.cost <= 3
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}