import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { UnitCard } from '../../../core/card/CardTypes';

export default class ResoluteUnderAnakinsCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2585318816',
            internalName: 'resolute#under-anakins-command'
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'This unit costs 1 resource less to play for every 5 damage on your base',
            amount: (_, player) => Math.floor(player.base.damage / 5),
        });

        this.addTriggeredAbility({
            title: 'Deal 2 damage to an enemy unit and each other enemy unit with the same name as that unit',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.source.controller.opponent.getUnitsInPlay(WildcardZoneName.AnyArena, (c: UnitCard) => c.title === context.target.title)
                })),
            }
        });
    }
}

