import { CardTypes, TargetModes } from '../../../Constants';
import { GameAction } from '../../../GameActions/GameAction';
import { StatusToken } from '../../../StatusToken';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

const ORIGINL_TOKEN = 'original';
const SELECTION = 'selection';

export default class AsakoKousuke extends DrawCard {
    static id = 'asako-kousuke';

    setupCardAbilities() {
        this.action({
            title: 'Treat the status token on a character as if it was another status token',
            condition: (context) => context.game.isDuringConflict(),
            cannotTargetFirst: true,
            targets: {
                [ORIGINL_TOKEN]: {
                    mode: TargetModes.Token,
                    cardType: CardTypes.Character,
                    cardCondition: (card: DrawCard, context) =>
                        card.isParticipating() && card.getGlory() <= context.source.getGlory()
                },
                [SELECTION]: {
                    dependsOn: ORIGINL_TOKEN,
                    mode: TargetModes.Select,
                    choices: (context) => {
                        const targetToken: StatusToken = context.tokens[ORIGINL_TOKEN][0];
                        const targetCard = targetToken.card;
                        if (!(targetCard instanceof DrawCard)) {
                            // should never happen
                            return {};
                        }

                        const choices = [] as Array<[string, GameAction]>;
                        if (!targetCard.isHonored) {
                            choices.push([
                                'Turn it into Honored',
                                AbilityDsl.actions.joint([
                                    AbilityDsl.actions.discardStatusToken({ target: targetToken }),
                                    AbilityDsl.actions.honor({ target: targetCard })
                                ])
                            ]);
                        }

                        if (!targetCard.isDishonored) {
                            choices.push([
                                'Turn it into Dishonored',
                                AbilityDsl.actions.joint([
                                    AbilityDsl.actions.discardStatusToken({ target: targetToken }),
                                    AbilityDsl.actions.dishonor({ target: targetCard })
                                ])
                            ]);
                        }

                        if (!targetCard.isTainted) {
                            choices.push([
                                'Turn it into Tainted',
                                AbilityDsl.actions.joint([
                                    AbilityDsl.actions.discardStatusToken({ target: targetToken }),
                                    AbilityDsl.actions.taint({ target: targetCard })
                                ])
                            ]);
                        }

                        return Object.fromEntries(choices);
                    }
                }
            },
            effect: 'clarify what it means to be {2}. The exposition reveals that {1} is {2}',
            effectArgs: (context) => [
                context.tokens[ORIGINL_TOKEN][0].card,
                context.selects.selection.choice === 'Turn it into Honored'
                    ? 'honored'
                    : context.selects.selection.choice === 'Turn it into Dishonored'
                    ? 'dishonored'
                    : 'tainted'
            ]
        });
    }
}