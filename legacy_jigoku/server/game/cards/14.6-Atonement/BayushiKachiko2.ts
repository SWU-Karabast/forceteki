import { AbilityContext } from '../../AbilityContext';
import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import { CardTypes, EventNames, Locations, Players, PlayTypes } from '../../Constants';
import DrawCard from '../../drawcard';
import { EventRegistrar } from '../../EventRegistrar';
import type Player from '../../player';

const MAXIMUM_CARDS_ALLOWED = 3;

export default class BayushiKachiko2 extends DrawCard {
    static id = 'bayushi-kachiko-2';

    private cardsPlayedThisRound = 0;
    private eventRegistrar?: EventRegistrar;
    private mostRecentEvent?: any;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnRoundEnded, EventNames.OnCharacterEntersPlay]);

        this.persistentEffect({
            effect: AbilityDsl.effects.delayedEffect({
                when: {
                    onCardPlayed: (event: any, context: AbilityContext) => {
                        if (this.cardsPlayedThisRound >= MAXIMUM_CARDS_ALLOWED) {
                            return false;
                        }
                        this.mostRecentEvent = event;
                        return (
                            event.originalLocation === Locations.ConflictDiscardPile &&
                            event.card.owner === context.player.opponent &&
                            event.card.type === CardTypes.Event &&
                            !event.onPlayCardSource &&
                            !event.card.fromOutOfPlaySource &&
                            event.player === context.player &&
                            !event.sourceOfCardPlayedFromConflictDiscard &&
                            context.game.isDuringConflict('political') &&
                            context.source.isParticipating()
                        );
                    }
                },
                gameAction: AbilityDsl.actions.handler({
                    handler: (context) => {
                        if (
                            this.mostRecentEvent.sourceOfCardPlayedFromConflictDiscard &&
                            this.mostRecentEvent.sourceOfCardPlayedFromConflictDiscard !== this
                        ) {
                            return;
                        }
                        if (!this.cardsPlayedThisRound || this.cardsPlayedThisRound < 0) {
                            this.cardsPlayedThisRound = 0;
                        }
                        this.mostRecentEvent.sourceOfCardPlayedFromConflictDiscard = this;
                        this.cardsPlayedThisRound++;
                        this.game.addMessage(
                            "{0} plays a card from their opponent's conflict discard pile due to the ability of {1} ({2} use{3} remaining)",
                            context.player,
                            context.source,
                            MAXIMUM_CARDS_ALLOWED - this.cardsPlayedThisRound,
                            MAXIMUM_CARDS_ALLOWED - this.cardsPlayedThisRound === 1 ? '' : 's'
                        );
                        this.game.addMessage(
                            '{0} is removed from the game due to the ability of {1}',
                            this.mostRecentEvent.card,
                            context.source
                        );
                        this.mostRecentEvent.card.owner.moveCard(this.mostRecentEvent.card, Locations.RemovedFromGame);
                    }
                })
            })
        });

        this.persistentEffect({
            condition: (context) =>
                context.game.isDuringConflict('political') &&
                context.source.isParticipating() &&
                this.cardsPlayedThisRound < MAXIMUM_CARDS_ALLOWED,
            location: Locations.PlayArea,
            targetLocation: Locations.ConflictDiscardPile,
            targetController: Players.Opponent,
            match: (card, context) =>
                card.type === CardTypes.Event &&
                card.location === Locations.ConflictDiscardPile &&
                card.owner === context.player.opponent,
            effect: [
                AbilityDsl.effects.canPlayFromOutOfPlay(
                    (player: Player, card: BaseCard) => player !== card.owner,
                    PlayTypes.PlayFromHand
                ),
                AbilityDsl.effects.registerToPlayFromOutOfPlay()
            ]
        });
    }

    public onRoundEnded() {
        this.cardsPlayedThisRound = 0;
    }

    public onCharacterEntersPlay(event: any) {
        if (event.card === this) {
            this.cardsPlayedThisRound = 0;
        }
    }
}
