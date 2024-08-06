import { CardTypes, Players, Durations, DuelTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class MasterOfTheBlade extends DrawCard {
    static id = 'master-of-the-blade';

    public setupCardAbilities() {
        this.duelStrike({
            title: "Don't bow during resolution",
            duelCondition: (duel, context) => duel.participants.includes(context.source),
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.source,
                condition: (context) => context.game.isDuringConflict(),
                duration: Durations.UntilEndOfConflict,
                effect: [
                    AbilityDsl.effects.doesNotBow(),
                    AbilityDsl.effects.cardCannot({
                        cannot: 'bow',
                        restricts: 'opponentsCardEffects',
                        applyingPlayer: context.player
                    })
                ]
            })),
            effect: "prevent opponents' actions from bowing {0} and stop it bowing at the end of the conflict"
        });
    }
}
