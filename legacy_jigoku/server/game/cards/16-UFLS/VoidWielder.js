const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Elements, CardTypes, Players, TargetModes } = require('../../Constants');

const elementKey = 'void-wielder-void';

class VoidWielder extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Wield the power of the void',
            condition: () => this.game.isDuringConflict(this.getCurrentElementSymbol(elementKey)),
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: (card, context) => card.isParticipating() && AbilityDsl.actions.sendHome().canAffect(card, context)
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'character',
                    player: context => context.targets.character.controller === context.player ? Players.Self : Players.Opponent,
                    choices: {
                        'Move this character home': AbilityDsl.actions.sendHome(context => ({ target: context.targets.character })),
                        'Discard a status token from this character': AbilityDsl.actions.selectToken(context => ({
                            card: context.targets.character,
                            player: context.targets.character.controller === context.player ? Players.Self : Players.Opponent,
                            activePromptTitle: 'Which token do you wish to discard?',
                            message: '{0} discards {1}',
                            effect: 'discard a status token from {0}',
                            effectArgs: () => context.targets.character,
                            messageArgs: (token, player) => [player, token],
                            gameAction: AbilityDsl.actions.discardStatusToken()
                        })),
                        'Discard an attachment from this character': AbilityDsl.actions.selectCard(context => ({
                            cardType: CardTypes.Attachment,
                            player: context.targets.character.controller === context.player ? Players.Self : Players.Opponent,
                            activePromptTitle: 'Which attachment do you wish to discard?',
                            cardCondition: (card, context) => card.parent === context.targets.character,
                            gameAction: AbilityDsl.actions.discardFromPlay(),
                            effect: 'discard an attachment from {0}',
                            effectArgs: () => context.targets.character,
                            message: '{0} discards {1}',
                            messageArgs: (card, player) => [player, card]
                        }))
                    }
                }
            }
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Contested Ring',
            element: Elements.Void
        });
        return symbols;
    }
}

VoidWielder.id = 'void-wielder';

module.exports = VoidWielder;
