import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer } from '../../../core/Constants';

export default class KraytDragon extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4935319539',
            internalName: 'krayt-dragon'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal damage equal to that card’s cost to their base or a ground unit they control',
            when: {
                onCardPlayed: (event, context) => event.player === context.player.opponent,
            },
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                zoneFilter: [ZoneName.GroundArena, ZoneName.Base],
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.event.card.cost,
                }))
            }
        });
    }
}
