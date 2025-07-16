import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class JabbasRancorPateesa extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8380936981',
            internalName: 'jabbas-rancor#pateesa',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addDecreaseCostAbility({
            title: 'If you control Jabba the Hutt, this unit costs 1 resource less to play',
            condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Jabba the Hutt'),
            amount: 1
        });

        registrar.addTriggeredAbility({
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
