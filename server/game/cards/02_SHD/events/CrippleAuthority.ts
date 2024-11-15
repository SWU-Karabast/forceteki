import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class CrippleAuthority extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3228620062',
            internalName: 'cripple-authority',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Draw a card. Each opponent who controls more resources than you discards a card from their hand',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                (context) => [
                    AbilityHelper.immediateEffects.draw({
                        target: context.source.controller,
                        amount: 1
                    }),
                    ...context.game.getPlayers()
                        .filter((player) => player !== context.source.controller && player.resources.length > context.source.controller.resources.length)
                        .map((player) =>
                            AbilityHelper.immediateEffects.discardCardsFromOwnHand({
                                target: player,
                                amount: 1
                            })
                        )
                ]
            )
        });
    }
}

CrippleAuthority.implemented = true;
