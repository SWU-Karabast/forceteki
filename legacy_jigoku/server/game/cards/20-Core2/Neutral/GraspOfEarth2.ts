import { AbilityTypes, CardTypes, Locations, Players } from '../../../Constants';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class GraspOfEarth2 extends DrawCard {
    static id = 'grasp-of-earth-2';

    public setupCardAbilities() {
        this.attachmentConditions({ trait: 'shugenja' });

        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            effect: AbilityDsl.effects.reduceCost({
                amount: 1,
                targetCondition: (target, _, context) => target.controller.hasAffinity('earth', context),
                match: (card, source) => card === source
            })
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.WouldInterrupt, {
                title: "Block a character's movement to the conflict",
                when: {
                    onMoveToConflict: (event: any, context: TriggeredAbilityContext) =>
                        event.card.type === CardTypes.Character && context.source.isParticipating()
                },
                effect: "deny {1}'s movement",
                effectArgs: (context: TriggeredAbilityContext) => [context.event.card],
                gameAction: AbilityDsl.actions.cancel()
            })
        });
    }
}