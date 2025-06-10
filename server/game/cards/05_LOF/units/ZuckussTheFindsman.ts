import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, TargetMode } from '../../../core/Constants';

export default class ZuckussTheFindsman extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0406487670',
            internalName: 'zuckuss#the-findsman',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Name a card, then discard the top card of the defending player\'s deck. If a card with that name is discarded, this unit gets +4/+0 for this attack.',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
                condition: (context) => context.player.opponent.drawDeck.length > 0   // skip ability if opponent has no cards in deck
            },
            then: (thenContext) => ({
                title: 'Discard the top card of the defending player\'s deck, if a card with that name is discarded, this unit gets +4/+0 for this attack.',
                thenCondition: (context) => context.player.opponent.drawDeck.length > 0,   // skip ability if opponent has no cards in deck
                immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 1,
                    target: context.source.activeAttack.getDefendingPlayer(),
                })),
                ifYouDo: (context) => ({
                    title: 'This unit gets +4/+0 for this attack',
                    ifYouDoCondition: () => {
                        const discardEvent = context.events.find((x) => x.name === EventName.OnCardDiscarded);
                        return discardEvent.card.title === thenContext.select;
                    },
                    immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
                    })
                })
            })
        });
    }
}