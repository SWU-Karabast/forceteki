import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class IkomaProdigy extends DrawCard {
    static id = 'ikoma-prodigy';

    setupCardAbilities() {
        this.reaction({
            title: 'Gain 1 honor',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source && context.source.fate > 0,
                onMoveFate: (event, context) => event.recipient === context.source && event.fate > 0
            },
            gameAction: AbilityDsl.actions.gainHonor()
        });
    }
}
