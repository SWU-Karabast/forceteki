import { CardTypes, Elements, Locations } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

const ELEMENT = 'courteous-greeting-earth';

export default class StewardOfCrypticLore extends DrawCard {
    static id = 'steward-of-cryptic-lore';

    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.modifyPoliticalSkill(3)
        });

        this.action({
            title: 'Changes the strength of the attacked province',
            condition: (context) => context.game.isDuringConflict(this.getCurrentElementSymbol(ELEMENT)),
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
                    options: {
                        "Raise attacked province's strength by 3": {
                            action: AbilityDsl.actions.cardLastingEffect(() => ({
                                targetLocation: Locations.Provinces,
                                effect: AbilityDsl.effects.modifyProvinceStrength(3)
                            })),
                            message: "{0} chooses to increase {1}'s strength by 3"
                        },
                        "Lower attacked province's strength by 3": {
                            action: AbilityDsl.actions.cardLastingEffect(() => ({
                                targetLocation: Locations.Provinces,
                                effect: AbilityDsl.effects.modifyProvinceStrength(-3)
                            })),
                            message: "{0} chooses to reduce {1}'s strength by 3"
                        }
                    }
                }))
            }))
        });
    }

    getPrintedElementSymbols() {
        const symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: ELEMENT,
            prettyName: 'Conflict Type',
            element: Elements.Earth
        });
        return symbols;
    }
}
