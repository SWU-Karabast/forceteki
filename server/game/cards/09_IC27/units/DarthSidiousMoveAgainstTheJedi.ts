import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class DarthSidiousMoveAgainstTheJedi extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-sidious#move-against-the-jedi-id',
            internalName: 'darth-sidious#move-against-the-jedi',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal that much damage to an enemy unit',
            contextTitle: (context) => `Deal ${context.event.damageHealed} damage to an enemy unit`,
            when: {
                onDamageHealed: (event, context) =>
                    event.context.player === context.player &&
                    event.card === context.player.base &&
                    event.damageHealed > 0
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.event.damageHealed,
                }))
            }
        });
    }
}
