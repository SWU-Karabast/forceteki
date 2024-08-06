import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class BambooTattoo extends DrawCard {
    static id = 'bamboo-tattoo';

    public setupCardAbilities() {
        this.attachmentConditions({ myControl: true, trait: 'monk' });

        this.whileAttached({ effect: AbilityDsl.effects.addTrait('tattooed') });

        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            effect: AbilityDsl.effects.reduceCost({
                amount: 1,
                targetCondition: (target) => target.type === CardTypes.Character && target.printedCost <= 3,
                match: (card, source) => card === source
            })
        });

        this.reaction({
            title: 'Ready attached character',
            when: {
                onCardBowed: (event, context) =>
                    context.source.parent &&
                    event.card === context.source.parent &&
                    event.context.source.type !== 'ring' &&
                    event.context.source.name !== 'Framework effect'
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.ready((context) => ({ target: context.source.parent })),
                AbilityDsl.actions.conditional({
                    condition: (context: TriggeredAbilityContext<this>) => this.isSelfTrigger(context),
                    trueGameAction: AbilityDsl.actions.dishonor((context) => ({ target: context.source.parent })),
                    falseGameAction: AbilityDsl.actions.noAction()
                })
            ]),
            effect: 'ready{1} {2}',
            effectArgs: (context) => [this.isSelfTrigger(context) ? ' and dishonor' : '', context.source.parent]
        });
    }

    private isSelfTrigger(context: TriggeredAbilityContext<this>) {
        return (
            context.source.controller &&
            context.event.context.player &&
            context.source.controller === context.event.context.player
        );
    }
}