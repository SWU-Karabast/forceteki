import AbilityDsl from '../../abilitydsl';
import { Conflict } from '../../conflict';
import { CardTypes, Locations, Players } from '../../Constants';
import DrawCard from '../../drawcard';

export default class SpellScroll extends DrawCard {
    static id = 'spell-scroll';

    setupCardAbilities() {
        this.whileAttached({
            condition: (context) =>
                context.source.parent?.isParticipating() &&
                (context.game.currentConflict as Conflict).elements.some((element) =>
                    (context.source.parent as DrawCard).hasTrait(element)
                ),
            effect: AbilityDsl.effects.modifyPoliticalSkill(3)
        });

        this.action({
            title: 'Put a card into your hand',
            condition: (context) => context.source.parent,
            target: {
                location: Locations.ConflictDiscardPile,
                controller: Players.Self,
                cardCondition: (card: DrawCard, context) =>
                    card.type !== CardTypes.Character &&
                    (context.source.parent as DrawCard).hasSomeTrait(card.getTraitSet()),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.moveCard((context) => ({
                        target: context.target,
                        destination: Locations.Hand
                    })),
                    AbilityDsl.actions.sacrifice((context) => ({ target: context.source }))
                ])
            },
            effect: 'move {1} to their hand and sacrifice {2}',
            effectArgs: (context) => [context.target, context.source]
        });
    }
}