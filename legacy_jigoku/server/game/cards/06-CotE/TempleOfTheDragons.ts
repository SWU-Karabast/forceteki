import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class TempleOfTheDragons extends ProvinceCard {
    static id = 'temple-of-the-dragons';

    setupCardAbilities() {
        this.reaction({
            title: 'Resolve the ring as if you were the attacker',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.resolveConflictRing()
        });
    }
}
