const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, Durations, Locations, Decks } = require('../../Constants');

class MasterpiecePainter extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Reveal and may play top conflict card',
            target: {
                mode: TargetModes.Select,
                targets: true,
                activePromptTitle: 'Choose any number of players',
                choices: {
                    [this.owner.name]: this.revealAndMayPlayAbility(this.owner),
                    [this.owner.opponent && this.owner.opponent.name || 'NA']: this.revealAndMayPlayAbility(this.owner.opponent),
                    [this.owner.name + ' and ' + (this.owner.opponent && this.owner.opponent.name || 'NA')]: AbilityDsl.actions.multiple([
                        this.revealAndMayPlayAbility(this.owner),
                        this.revealAndMayPlayAbility(this.owner.opponent)
                    ])
                }
            },
            effect: 'make {1} reveal the top card of their deck. They may play their card until the end of the phase.',
            effectArgs: context => context.select
        });
    }

    revealAndMayPlayAbility(player) {
        return AbilityDsl.actions.playerLastingEffect(() => {
            let chosenPlayer = player;
            let topCard = chosenPlayer.conflictDeck.first();

            return {
                targetController: player,
                duration: Durations.Custom,
                until: {
                    onCardMoved: event => event.card === topCard && event.originalLocation === Locations.ConflictDeck,
                    onPhaseEnded: () => true,
                    onDeckShuffled: event => event.player === chosenPlayer && event.deck === Decks.ConflictDeck
                },
                effect: [
                    AbilityDsl.effects.showTopConflictCard(),
                    AbilityDsl.effects.canPlayFromOwn(Locations.ConflictDeck, [topCard], this)
                ]
            };
        });
    }
}

MasterpiecePainter.id = 'masterpiece-painter';

module.exports = MasterpiecePainter;
