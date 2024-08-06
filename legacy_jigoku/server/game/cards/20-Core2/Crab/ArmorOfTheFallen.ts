import { AbilityContext } from '../../../AbilityContext';
import { AbilityTypes, CardTypes, Locations, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ArmorOfTheFallen extends DrawCard {
    static id = 'armor-of-the-fallen';

    public setupCardAbilities() {
        this.attachmentConditions({ trait: 'bushi' });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Remove characters from your discard pile to bow a character',
                condition: (context: AbilityContext) => context.source.isParticipating(),
                cost: AbilityDsl.costs.removeFromGame({
                    cardType: CardTypes.Character,
                    location: [Locations.DynastyDiscardPile, Locations.ConflictDiscardPile],
                    mode: TargetModes.Unlimited
                }),
                target: {
                    cardType: CardTypes.Character,
                    cardCondition: (card: DrawCard, context: AbilityContext) =>
                        card.isParticipating() && card.printedCost <= this.#maxCostReachable(context),
                    gameAction: AbilityDsl.actions.bow()
                },
                cannotTargetFirst: true
            })
        });
    }

    #maxCostReachable(context: AbilityContext) {
        if (context.costs.removeFromGame) {
            return context.costs.removeFromGame.length;
        }

        const dynasty = this.#sumCharactersInPile(context.player.dynastyDiscardPile);
        const conflict = this.#sumCharactersInPile(context.player.conflictDiscardPile);
        return dynasty + conflict;
    }

    #sumCharactersInPile(pile: DrawCard[]): number {
        return pile.reduce((sum: number, card: DrawCard) => (card.type === CardTypes.Character ? sum + 1 : sum), 0);
    }
}
