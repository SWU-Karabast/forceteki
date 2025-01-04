import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait } from '../../../core/Constants';

export default class BountyPosting extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6151970296',
            internalName: 'bounty-posting',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search your deck for a Bounty upgrade, reveal it, and draw it. (Shuffle your deck.)',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                cardCondition: (card) => card.isUpgrade() && card.hasSomeTrait(Trait.Bounty),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard(),
                shuffleWhenDone: true
            }),
            ifYouDo: (context) => ({
                title: 'Play that upgrade (paying its cost).',
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: () =>
                        context.targets.length === 1 &&
                        context.source.controller.readyResourceCount >= context.targets[0].cost,
                    onTrue: AbilityHelper.immediateEffects.playCardFromHand({
                        target: context.targets[0]
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })


            })
        });
    }
}

BountyPosting.implemented = true;