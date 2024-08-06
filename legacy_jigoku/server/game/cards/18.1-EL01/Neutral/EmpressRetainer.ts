import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

function modifier(_: unknown, context: AbilityContext<EmpressRetainer>) {
    if (context.player.imperialFavor !== '') {
        return 1;
    }
    if (context.player.opponent.imperialFavor !== '') {
        return -1;
    }
    return 0;
}

export default class EmpressRetainer extends DrawCard {
    static id = 'empress-retainer';

    setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) => card === context.source,
            effect: AbilityDsl.effects.modifyBothSkills(modifier)
        });
    }
}
