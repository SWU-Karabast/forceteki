import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

const CHARACTER = 'CHARACTER';
const SELECT = 'SELECT';

export default class AkodoCho extends DrawCard {
    static id = 'akodo-cho';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            condition: (context) =>
                context.source.isParticipating() &&
                context.source.attachments.some((attachment) => attachment.hasTrait('follower')),
            targets: {
                [CHARACTER]: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: (card, context) =>
                        card.isParticipating() && context.game.actions.bow().canAffect(card, context)
                },
                [SELECT]: {
                    mode: TargetModes.Select,
                    dependsOn: CHARACTER,
                    player: (context) =>
                        context.targets[CHARACTER].controller === context.player ? Players.Self : Players.Opponent,
                    choices: {
                        'Discard an attachment from this character': AbilityDsl.actions.selectCard((context) => ({
                            cardType: CardTypes.Attachment,
                            effect: 'discard an attachment on {0}',
                            effectArgs: (context) => [context.targets[CHARACTER]],
                            player:
                                context.targets[CHARACTER].controller === context.player
                                    ? Players.Self
                                    : Players.Opponent,
                            activePromptTitle: 'Choose an attachment to discard',
                            cardCondition: (card) => card.parent === context.targets[CHARACTER],
                            message: '{0} discards {1}',
                            messageArgs: (card) => [context.targets[CHARACTER].controller, card],
                            gameAction: AbilityDsl.actions.discardFromPlay()
                        })),
                        'Bow this character': AbilityDsl.actions.bow((context) => ({
                            target: context.targets[CHARACTER]
                        }))
                    }
                }
            },
            cannotTargetFirst: true
        });
    }
}
