import { Phases } from '../../../Constants';
import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

export default class PlantedFields extends DrawCard {
    static id = 'planted-fields';

    public setupCardAbilities() {
        this.interrupt({
            title: 'Gain 1 fate, gain 1 honor and draw 1 card',
            when: {
                onPhaseEnded: (event, context) =>
                    event.phase === Phases.Conflict &&
                    !context.player.getProvinceCardInProvince(context.source.location).isBroken
            },
            cost: AbilityDsl.costs.sacrificeSelf(),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.gainFate((context) => ({
                    target: context.player,
                    amount: 2
                })),
                AbilityDsl.actions.draw((context) => ({
                    target: context.player,
                    amount: 2
                }))
            ]),
            effect: 'gain 2 fate and draw 2 cards'
        });
    }
}
