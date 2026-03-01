import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class GalacticEscalation extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1590343202',
            internalName: 'galactic-escalation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Each player resources the top card of their deck',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) =>
                context.game.getPlayers().map((player) =>
                    AbilityHelper.immediateEffects.resourceCard({
                        target: player.getTopCardOfDeck(),
                        targetPlayer: EnumHelpers.asRelativePlayer(player, context.player)
                    })
                )
            )
        });
    }
}