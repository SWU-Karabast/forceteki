import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class CantorOfGales extends DrawCard {
    static id = 'cantor-of-gales';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) =>
                context.source.isAtHome() &&
                context.player.cardsInPlay.any((card: DrawCard) => card.isParticipating() && card.isHonored),
            effect: AbilityDsl.effects.changePlayerSkillModifier(2)
        });
    }
}