import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Players, CharacterStatus } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { StatusToken } from '../../../StatusToken';

export default class ForcedRetirement extends DrawCard {
    static id = 'forced-retirement';

    public setupCardAbilities() {
        this.action({
            title: 'Remove negative status tokens from a character, and discard it from play',
            effect: "expiate {0}'s misdeeds by retiring them to the nearest monatery{1} Let them contemplate their sins.",
            effectArgs: (context) => [
                context.target.fate > 0 ? ', recovering their ' + context.target.fate + ' fate.' : '.'
            ],
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => (card.isDishonored || card.isTainted) && !card.isParticipating()
            },
            gameAction: AbilityDsl.actions.sequentialContext((context) => ({
                gameActions: [
                    AbilityDsl.actions.multiple([
                        AbilityDsl.actions.discardStatusToken({
                            target: [
                                context.target.statusTokens.filter(
                                    (t: StatusToken) =>
                                        t.grantedStatus === CharacterStatus.Dishonored ||
                                        t.grantedStatus === CharacterStatus.Tainted
                                )
                            ]
                        }),
                        AbilityDsl.actions.removeFate({
                            target: context.target,
                            amount: context.target.getFate(),
                            recipient: context.target.owner
                        })
                    ]),
                    AbilityDsl.actions.multiple([
                        AbilityDsl.actions.discardFromPlay({
                            target: context.target
                        }),
                        AbilityDsl.actions.gainHonor({
                            target: context.player,
                            amount: 1
                        })
                    ])
                ]
            }))
        });
    }
}