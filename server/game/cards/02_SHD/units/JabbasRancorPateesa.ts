import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class JabbasRancorPateesa extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8380936981',
            internalName: 'jabbas-rancor#pateesa',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addDecreaseCostAbility({
            title: 'If you control Jabba the Hutt, this unit costs 1 resource less to play',
            condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Jabba the Hutt'),
            amount: 1
        });

        card.addTriggeredAbility({
            title: 'Deal 3 damage to another friendly ground unit and 3 damage to an enemy ground unit',
            when: {
                whenPlayed: true,
                onAttack: true,
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
