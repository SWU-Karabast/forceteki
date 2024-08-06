const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players, TargetModes } = require('../../Constants');

class DirectingTheBattle extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Direct the Battle',
            condition: context => context.game.isDuringConflict(),
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    controller: Players.Any
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'character',
                    player: context => context.targets.character.controller === context.player ? Players.Self : Players.Opponent,
                    choices: {
                        'Move this character home': AbilityDsl.actions.sendHome(context => ({
                            target: context.targets.character
                        })),
                        'Give +3 Military': AbilityDsl.actions.cardLastingEffect(context => ({
                            effect: AbilityDsl.effects.modifyMilitarySkill(3),
                            target: context.targets.character
                        })),
                        'Prevent bowing during conflict': AbilityDsl.actions.cardLastingEffect(context => ({
                            effect: AbilityDsl.effects.cardCannot({
                                cannot: 'bow',
                                restricts: 'opponentsCardEffects',
                                applyingPlayer: context.player
                            }),
                            target: context.targets.character
                        }))
                    }
                }
            },
            effect: '{1}{2}{3}{4}',
            effectArgs: context => {
                if(context.selects.select.choice === 'Move this character home') {
                    return ['send ', context.targets.character, ' home', ''];
                }
                if(context.selects.select.choice === 'Give +3 Military') {
                    return ['give ', context.targets.character, ' +3', 'military'];
                }
                return ['prevent ', context.targets.character, ' from being bowed by opponent\'s card effects', ''];
            }
        });
    }
}

DirectingTheBattle.id = 'directing-the-battle';

module.exports = DirectingTheBattle;
