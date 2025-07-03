import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { GameStateChangeRequired, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class GuerillaInsurgency extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7235023816',
            internalName: 'guerilla-insurgency',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Each player defeats a resource they control and discards 2 cards from their hand. Deal 4 damage to each ground unit',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Resource,
                    mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                    activePromptTitle: 'Defeat a resource you control',
                    effect: 'make {0} defeat a resource',
                    effectArgs: (context) => [context.player],
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }),
                AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Opponent,
                    player: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.Resource,
                    mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                    activePromptTitle: 'Defeat a resource you control',
                    effect: 'make {0} defeat a resource',
                    effectArgs: (context) => [context.player.opponent],
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }),
                AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    target: context.game.getPlayers(),
                    amount: 2
                })),
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 4,
                    target: context.game.getPlayers().reduce((units, player) => units.concat(player.getArenaUnits({ arena: ZoneName.GroundArena })), [])
                }))
            ])
        });
    }
}
