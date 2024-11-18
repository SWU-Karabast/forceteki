import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class JabbasRancorPateesa extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8380936981',
            internalName: 'jabbas-rancor#pateesa',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'If you control Jabba the Hutt, this unit costs 1 resource less to play',
            condition: (context) =>
                context.source.controller.leader.title === 'Jabba the Hutt' ||
                context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.title === 'Jabba the Hutt').length > 0,
            amount: 1
        });

        this.addTriggeredAbility({
            title: 'Deal 3 damage to another friendly ground unit and 3 damage to an enemy ground unit',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
            },
            targetResolvers: {
                myGroundUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.GroundArena,
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                },
                theirGroundUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                }
            }
        });
    }
}

JabbasRancorPateesa.implemented = true;
