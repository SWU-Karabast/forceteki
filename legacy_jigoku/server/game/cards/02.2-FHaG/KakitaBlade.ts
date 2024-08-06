import type { Duel } from '../../Duel';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class KakitaBlade extends DrawCard {
    static id = 'kakita-blade';

    setupCardAbilities() {
        this.whileAttached({
            condition: () => this.game.currentDuel?.isInvolvedInAnyDuel(this.parent) ?? false,
            effect: AbilityDsl.effects.modifyPoliticalSkill(2)
        });

        this.reaction({
            title: 'Gain honor on duel win',
            when: {
                afterDuel: (event: Duel, context) => event.winner?.includes(context.source.parent) ?? false
            },
            gameAction: AbilityDsl.actions.gainHonor()
        });
    }
}
