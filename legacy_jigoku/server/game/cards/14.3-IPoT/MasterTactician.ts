import type { AbilityContext } from '../../AbilityContext';
import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import { EventNames, Locations, Players, PlayTypes } from '../../Constants';
import DrawCard from '../../drawcard';
import { EventRegistrar } from '../../EventRegistrar';
import type Player from '../../player';

const MAXIMUM_CARDS_ALLOWED = 3;

export default class MasterTactician extends DrawCard {
    static id = 'master-tactician';

    private cardsPlayedThisRound = 0;
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
                            event.originalLocation === Locations.ConflictDeck &&
                            !event.onPlayCardSource &&
                            !event.card.fromOutOfPlaySource &&
                            event.originallyOnTopOfConflictDeck &&
                            event.player === context.player &&
                            !event.sourceOfCardPlayedFromConflictDeck &&
                            context.source.isParticipating() &&
                            context.game.isTraitInPlay('battlefield')
                        );
                    }
                },
                gameAction: AbilityDsl.actions.handler({
                    handler: (context) => {
                        if (
                            this.mostRecentEvent.sourceOfCardPlayedFromConflictDeck &&
                            this.mostRecentEvent.sourceOfCardPlayedFromConflictDeck !== this
                        ) {
                            return;
                        }
                        if (!this.cardsPlayedThisRound || this.cardsPlayedThisRound < 0) {
                            this.cardsPlayedThisRound = 0;
                        }
                        this.mostRecentEvent.sourceOfCardPlayedFromConflictDeck = this;
                        this.cardsPlayedThisRound++;
                        this.game.addMessage(
                            '{0} plays a card from their conflict deck due to the ability of {1} ({2} use{3} remaining)',
                            context.player,
                            context.source,
                            MAXIMUM_CARDS_ALLOWED - this.cardsPlayedThisRound,
                            MAXIMUM_CARDS_ALLOWED - this.cardsPlayedThisRound === 1 ? '' : 's'
                        );
                    }
                })
            })
        });

        this.persistentEffect({
            condition: (context) =>
                context.game.isTraitInPlay('battlefield') &&
                context.source.isParticipating() &&
                this.cardsPlayedThisRound < MAXIMUM_CARDS_ALLOWED,
            targetLocation: Locations.ConflictDeck,
            targetController: Players.Self,
            match: (card, context) =>
                context && context.player.conflictDeck.size() > 0 && card === context.player.conflictDeck.first(),
            effect: AbilityDsl.effects.canPlayFromOutOfPlay(
                (player: Player, card: BaseCard) => player === card.owner,
                PlayTypes.PlayFromHand
            )
        });

        this.persistentEffect({
            condition: (context) => {
                const defending = context.game.currentConflict && context.player.isDefendingPlayer();
                const preventShowing = defending && !context.game.currentConflict.defendersChosen;
                return context.game.isTraitInPlay('battlefield') && context.source.isParticipating() && !preventShowing;
            },
            targetController: Players.Self,
            effect: AbilityDsl.effects.showTopConflictCard(Players.Self)
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
