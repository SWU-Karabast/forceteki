import AbilityDsl from '../../../abilitydsl';
import { AbilityTypes, CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { ActionProps } from '../../../Interfaces';

export default class DragonsClaw extends DrawCard {
    static id = 'dragon-s-claw';

    setupCardAbilities() {
        this.whileAttached({
            match: (card: DrawCard) => card.attachments.some((a) => a.name === "Dragon's Fang"),
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Bow and send home a participating character with lower military skill',
                condition: (context) => context.source.isParticipating(),
                target: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: (card, context) =>
                        card.isParticipating() && card.getMilitarySkill() < context.source.getMilitarySkill(),
                    gameAction: AbilityDsl.actions.multiple([AbilityDsl.actions.bow(), AbilityDsl.actions.sendHome()])
                }
            } as ActionProps<DrawCard>)
        });
    }
}
