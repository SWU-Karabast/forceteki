import { CardTypes, Durations, Elements } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

const COVERT_ELEMENT = 'adept-of-the-waves-water';

export default class AdeptOfTheWaves extends DrawCard {
    static id = 'adept-of-the-waves';

    setupCardAbilities() {
        this.action({
            title: 'Grant Covert to a character',
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.handler({
                        handler: () => {
                            this.elementWhenTriggered = this.getCurrentElementSymbol(COVERT_ELEMENT);
                        }
                    }),
                    AbilityDsl.actions.cardLastingEffect(() => ({
                        duration: Durations.UntilEndOfPhase,
                        condition: () => this.game.isDuringConflict(this.elementWhenTriggered),
                        effect: AbilityDsl.effects.addKeyword('covert')
                    }))
                ])
            },
            effect: 'grant Covert during {1} conflicts to {0}',
            effectArgs: () => [this.getCurrentElementSymbol(COVERT_ELEMENT)]
        });
    }

    getPrintedElementSymbols() {
        const symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: COVERT_ELEMENT,
            prettyName: 'Contested Ring',
            element: Elements.Water
        });
        return symbols;
    }
}
