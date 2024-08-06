import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class HidaYakamo extends DrawCard {
    static id = 'hida-yakamo';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.player.opponent && context.player.isLessHonorable(),
            effect: AbilityDsl.effects.cardCannot('loseDuels')
        });

        this.persistentEffect({
            condition: (context) =>
                context.player.opponent && context.player.isLessHonorable() && this.game.isDuringConflict('military'),
            effect: AbilityDsl.effects.doesNotBow()
        });
    }
}
