import { Durations } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class Desolation extends DrawCard {
    static id = 'desolation';

    public setupCardAbilities() {
        this.action({
            title: "Blank opponent's provinces",
            cost: AbilityDsl.costs.payHonor(2),
            condition: (context) => context.player.opponent !== undefined,
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: this.game.provinceCards.filter((a: ProvinceCard) => a.controller === context.player.opponent),
                duration: Durations.UntilEndOfPhase,
                effect: AbilityDsl.effects.blank()
            })),
            effect: "blank {1}'s provinces until the end of the phase",
            effectArgs: (context) => context.player.opponent.name
        });
    }
}
