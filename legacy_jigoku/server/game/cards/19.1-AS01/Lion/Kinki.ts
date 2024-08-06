import { CardTypes, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class Kinki extends DrawCard {
    static id = 'kinki';

    public setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.action({
            title: 'Remove a fate from or move home a character',
            cost: AbilityDsl.costs.sacrificeSelf(),
            condition: (context) =>
                context.game.isDuringConflict('military') &&
                context.source.parent &&
                context.source.parent.isParticipating(),
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card) => card.isParticipating()
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'character',
                    player: Players.Opponent,
                    choices: {
                        'Remove a fate from this character': AbilityDsl.actions.removeFate((context) => ({
                            target: context.targets.character
                        })),
                        'Move this character home': AbilityDsl.actions.sendHome((context) => ({
                            target: context.targets.character
                        }))
                    }
                }
            },
            max: AbilityDsl.limit.perRound(1)
        });
    }
}
