import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ResoluteUnderAnakinsCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2585318816',
            internalName: 'resolute#under-anakins-command'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'This unit costs 1 resource less to play for every 5 damage on your base',
            amount: (_, player) => Math.floor(player.base.damage / 5),
        });

        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to an enemy unit and each other enemy unit with the same name as that unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.player.opponent.getArenaUnits({ condition: (card) => card.isUnit() && card.title === context.target.title })
                })),
            }
        });
    }
}

