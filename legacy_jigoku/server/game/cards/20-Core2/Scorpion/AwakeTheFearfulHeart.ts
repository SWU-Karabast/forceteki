import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Conflict } from '../../../conflict';
import { CardTypes } from '../../../Constants';

export default class AwakeTheFearfulHeart extends DrawCard {
    static id = 'awake-the-fearful-heart';

    setupCardAbilities() {
        this.action({
            title: 'Move home each character without fate',
            condition: (context) =>
                context.player.cardsInPlay.some(
                    (card: DrawCard) => card.isParticipating() && card.hasTrait('shugenja')
                ),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.sendHome((context) => ({
                    target:
                        (context.game.currentConflict as Conflict | null)?.getParticipants(
                            (character) => character.fate === 0
                        ) ?? []
                })),
                AbilityDsl.actions.onAffinity({
                    trait: 'air',
                    gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                        target: context.game.findAnyCardsInPlay(
                            (card: DrawCard) => card.getType() === CardTypes.Character
                        ),
                        effect: AbilityDsl.effects.cardCannot('moveToConflict')
                    })),
                    effect: 'forbid all players from moving characters into the conflict'
                })
            ])
        });
    }
}
