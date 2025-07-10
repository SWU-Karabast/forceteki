import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode } from '../../../core/Constants';

export default class SearchYourFeelings extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7485151088',
            internalName: 'search-your-feelings',
        };
    }

    // TODO: since the card display prompt can't handle showing the full deck currently, we instead use a dropdown list of card names
    // once the prompt is fixed, we can go back to using that for deck search like other cards do
    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose the name of a card from your deck to draw',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: (context) => this.getDistinctCardNamesInDeck(context),
                logSelection: false,
                condition: (context) => context.player.drawDeck.length > 0,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.drawSpecificCard((context) => ({
                        target: context.player.drawDeck.find((card) => this.buildCardName(card) === context.select)
                    })),
                    AbilityHelper.immediateEffects.shuffleDeck((context) => ({
                        target: context.player
                    }))
                ])
            },
        });
    }

    private getDistinctCardNamesInDeck(context: AbilityContext): string[] {
        const cardNamesInDeck = context.player.drawDeck.map((card) => this.buildCardName(card));
        return [...new Set(cardNamesInDeck)];
    }

    private buildCardName(card: Card): string {
        return `${card.title}${card.subtitle ? ', ' + card.subtitle : ''}`;
    }
}
