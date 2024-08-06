import { CardTypes, Elements } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

const ELEMENT = 'master-alchemist-fire';

export default class MasterAlchemist extends DrawCard {
    static id = 'master-alchemist';

    setupCardAbilities() {
        this.action({
            title: 'Honor or dishonor a character',
            cost: AbilityDsl.costs.payFateToRing(1, (ring) => ring.hasElement(this.getCurrentElementSymbol(ELEMENT))),
            condition: () => this.game.isDuringConflict(),
            target: {
                activePromptTitle: 'Choose a character to honor or dishonor',
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.chooseAction({
                    options: {
                        'Honor this character': {
                            action: AbilityDsl.actions.honor(),
                            message: '{0} chooses to honor {1}'
                        },
                        'Dishonor this character': {
                            action: AbilityDsl.actions.dishonor(),
                            message: '{0} chooses to dishonor {1}'
                        }
                    }
                })
            }
        });
    }

    getPrintedElementSymbols() {
        const symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: ELEMENT,
            prettyName: 'Ring for Fate',
            element: Elements.Fire
        });
        return symbols;
    }
}
