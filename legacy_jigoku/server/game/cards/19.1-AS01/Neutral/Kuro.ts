import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class Kuro extends DrawCard {
    static id = 'kuro';

    public allowAttachment(attachment: DrawCard) {
        if (attachment.printedCost < 1) {
            return false;
        }
        return super.allowAttachment(attachment);
    }

    public setupCardAbilities() {
        this.action({
            title: 'Play opponent discarded attachment',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                location: Locations.ConflictDiscardPile,
                controller: Players.Opponent,
                cardType: CardTypes.Attachment,
                mode: TargetModes.Single,
                cardCondition: (card) =>
                    card.printedCost >= 1 && card.canAttach(this, { ignoreType: false, controller: this.controller }),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.playerLastingEffect((context) => ({
                        targetController: context.player,
                        effect: AbilityDsl.effects.reduceNextPlayedCardCost(1)
                    })),
                    AbilityDsl.actions.playCard((context) => ({
                        source: this,
                        payCosts: true,
                        target: context.target,
                        optional: false,
                        playCardTarget: (attachContext) => {
                            attachContext.target = context.source;
                            attachContext.targets.target = context.source;
                        }
                    })),
                    AbilityDsl.actions.conditional((conditionalContext) => ({
                        condition: (context) => context.source.isParticipating(),
                        trueGameAction: AbilityDsl.actions.sendHome({ target: conditionalContext.source }),
                        falseGameAction: AbilityDsl.actions.moveToConflict({ target: conditionalContext.source })
                    }))
                ])
            },
            effect: "seek the lost treasure '{1}'. {2}",
            effectArgs: (context) => [
                context.target,
                context.source.isParticipating()
                    ? 'Kuro returns home with their treasure'
                    : 'Kuro swoops into the conflict'
            ]
        });
    }
}