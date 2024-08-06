import { CardTypes, Durations, Players } from '../../../Constants';
import { Direction } from '../../../GameActions/ModifyBidAction';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class WaitUntilItSings extends DrawCard {
    static id = 'wait-until-it-sings';

    setupCardAbilities() {
        this.action({
            title: 'Take an action during conflict resolutino',
            condition: context => context.game.currentConflict.getParticipants().some(p => p.controller === context.player && p.hasTrait('commander')),
            gameAction: AbilityDsl.actions.playerLastingEffect(context => ({
                targetController: context.player,
                duration: Durations.UntilEndOfConflict,
                effect: AbilityDsl.effects.additionalActionAfterWindowCompleted(1)
            })),
            effect: 'take an action before conflict resolution',
            max: AbilityDsl.limit.perConflict(1)
        });
    }
}
