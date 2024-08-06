import type CardAbility from '../../../CardAbility';
import { CardTypes, Players, TargetModes, EventNames } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ALegionOfOne extends DrawCard {
    static id = 'a-legion-of-one';

    setupCardAbilities() {
        this.action({
            title: 'Give a solitary character +3/+0',
            condition: () => this.game.isDuringConflict('military'),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card, context) =>
                    card.isParticipating() &&
                    this.game.currentConflict.getNumberOfParticipantsFor(context.player) === 1,
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.modifyMilitarySkill(3)
                })
            },
            effect: 'give {0} +3/+0',
            then: (context) => {
                if (context.subResolution) {
                    return {
                        target: {
                            mode: TargetModes.Select,
                            choices: {
                                'Remove 1 fate for no effect': AbilityDsl.actions.removeFate({
                                    target: context.target
                                }),
                                Done: () => true
                            }
                        },
                        message: '{0} chooses {3}to remove a fate for no effect',
                        messageArgs: (context) => (context.select === 'Done' ? 'not ' : '')
                    };
                }
                return {
                    target: {
                        mode: TargetModes.Select,
                        choices: {
                            'Remove 1 fate to resolve this ability again': AbilityDsl.actions.removeFate({
                                target: context.target
                            }),
                            Done: () => true
                        }
                    },
                    message: '{0} chooses {3}to remove a fate to resolve {1} again',
                    messageArgs: (context) => (context.select === 'Done' ? 'not ' : ''),
                    then: {
                        thenCondition: (event) =>
                            event.origin === context.target && !event.cancelled && event.name === EventNames.OnMoveFate,
                        gameAction: AbilityDsl.actions.resolveAbility({
                            ability: context.ability as CardAbility,
                            subResolution: true,
                            choosingPlayerOverride: context.choosingPlayerOverride
                        })
                    }
                };
            }
        });
    }
}
