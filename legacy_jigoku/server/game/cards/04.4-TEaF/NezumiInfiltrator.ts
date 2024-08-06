import { CardTypes, Locations } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class NezumiInfiltrator extends DrawCard {
    static id = 'nezumi-infiltrator';

    setupCardAbilities() {
        this.persistentEffect({
            effect: [
                AbilityDsl.effects.immunity({
                    restricts: 'maho'
                }),
                AbilityDsl.effects.immunity({
                    restricts: 'shadowlands'
                })
            ]
        });

        this.reaction({
            title: "Change attacked province's strength",
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source && this.game.isDuringConflict()
            },
            max: AbilityDsl.limit.perConflict(1),
            effect: 'change the province strength of an attacked province',
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: (card) => card.isConflictProvince(),
                subActionProperties: (card) => {
                    context.target = card;
                    return { target: card };
                },
                gameAction: AbilityDsl.actions.chooseAction(() => ({
                    messages: {},
                    options: {
                        "Raise attacked province's strength by 1": {
                            action: AbilityDsl.actions.cardLastingEffect(() => ({
                                targetLocation: Locations.Provinces,
                                effect: AbilityDsl.effects.modifyProvinceStrength(1)
                            })),
                            message: "{0} chooses to increase {1}'s strength by 1"
                        },
                        "Lower attacked province's strength by 1": {
                            action: AbilityDsl.actions.cardLastingEffect((context) => ({
                                targetLocation: Locations.Provinces,
                                effect:
                                    context.target.getStrength() > 1
                                        ? AbilityDsl.effects.modifyProvinceStrength(-1)
                                        : []
                            })),
                            message: "{0} chooses to reduce {1}'s strength by 1"
                        }
                    }
                }))
            }))
        });
    }
}
