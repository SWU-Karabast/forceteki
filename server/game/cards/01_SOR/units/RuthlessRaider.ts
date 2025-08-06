import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class RuthlessRaider extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1047592361',
            internalName: 'ruthless-raider'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to an enemy base and 2 damage to an enemy unit',
            when: {
                whenPlayed: true,
                whenDefeated: true
            },
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }),
                AbilityHelper.immediateEffects.damage((context) => ({ amount: 2, target: context.player.opponent.base }))
            ])
        });
    }
}
