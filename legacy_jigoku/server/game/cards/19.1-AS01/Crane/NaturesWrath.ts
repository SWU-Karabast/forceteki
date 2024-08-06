import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import CardAbility from '../../../CardAbility';
import { CardTypes, ConflictTypes, EventNames, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

const TARGET_CHARACTER = 'character';

function selfDishonorSelect(message: string) {
    return AbilityDsl.actions.selectCard((context: AbilityContext) => ({
        cardType: CardTypes.Character,
        controller: Players.Self,
        cardCondition: (card: BaseCard) => card.isParticipating(),
        gameAction: AbilityDsl.actions.dishonor(),
        message: message,
        messageArgs: (card: BaseCard) => [context.player, card, context.source]
    }));
}

export default class NaturesWrath extends DrawCard {
    static id = 'nature-s-wrath';

    public setupCardAbilities() {
        this.action({
            title: 'Dishonor or move home a character',
            condition: (context) =>
                context.game.isDuringConflict(ConflictTypes.Military) &&
                context.player.anyCardsInPlay((card: BaseCard) => card.isParticipating()),
            targets: {
                [TARGET_CHARACTER]: {
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card) => card.isParticipating()
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: TARGET_CHARACTER,
                    player: Players.Opponent,
                    choices: {
                        'Dishonor this character': AbilityDsl.actions.dishonor((context: AbilityContext) => ({
                            target: context.targets[TARGET_CHARACTER]
                        })),
                        'Move this character home': AbilityDsl.actions.sendHome((context: AbilityContext) => ({
                            target: context.targets[TARGET_CHARACTER]
                        }))
                    }
                }
            },
            then: (context) => {
                if (!context.subResolution) {
                    return {
                        target: {
                            mode: TargetModes.Select,
                            choices: {
                                'Dishonor a participating character to resolve this ability again': selfDishonorSelect(
                                    '{0} chooses to dishonor {1} to resolve {2} again'
                                ),
                                Done: () => true
                            }
                        },
                        then: {
                            thenCondition: (event: any) =>
                                event.origin === context.target &&
                                !event.cancelled &&
                                event.name === EventNames.OnCardDishonored,
                            gameAction: AbilityDsl.actions.resolveAbility({
                                ability: context.ability instanceof CardAbility ? context.ability : null,
                                subResolution: true,
                                choosingPlayerOverride: context.choosingPlayerOverride
                            })
                        }
                    };
                }
                return {
                    target: {
                        mode: TargetModes.Select,
                        choices: {
                            'Dishonor a participating character for no effect': selfDishonorSelect(
                                '{0} chooses to dishonor {1} for no effect'
                            ),
                            Done: () => true
                        }
                    }
                };
            },
            cannotTargetFirst: true,
            max: AbilityDsl.limit.perConflict(1)
        });
    }
}
