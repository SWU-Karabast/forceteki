import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class WarriorOfTheOpenHand extends DrawCard {
    static id = 'warrior-of-the-open-hand';

    setupCardAbilities() {
        this.action({
            title: 'Return to hand',
            condition: (context) =>
                context.source.isParticipating() &&
                context.game.currentConflict.getNumberOfParticipantsFor(context.player.opponent) > 0,
            gameAction: AbilityDsl.actions.returnToHand(),
            max: AbilityDsl.limit.perRound(1)
        });
    }
}