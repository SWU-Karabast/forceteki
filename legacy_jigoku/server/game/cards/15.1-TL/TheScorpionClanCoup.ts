import { CardTypes, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class TheScorpionClanCoup extends ProvinceCard {
    static id = 'the-scorpion-clan-coup';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) =>
                context.player.isDefendingPlayer() &&
                context.player.cardsInPlay.any(
                    (card) => card.getType() === CardTypes.Character && card.hasTrait('imperial')
                ),
            targetController: Players.Opponent,
            match: (card) => card.isAttacking(),
            effect: AbilityDsl.effects.modifyBothSkills(-1)
        });
    }
}
