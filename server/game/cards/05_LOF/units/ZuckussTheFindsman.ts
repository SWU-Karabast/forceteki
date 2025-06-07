import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

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
            },
            then: (thenContext) => ({
                title: 'If a card with that name is discarded, this unit gets +4/+0 for this attack.',
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                        amount: 1,
                        target: context.source.activeAttack.getDefendingPlayer(),
                    })),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => {
                            const event = context.events.find((x) => x.name === 'onCardDiscarded');
                            return !!event && event.card.title === thenContext.select;
                        },
                        onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                            effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
                        })
                    })
                ])
            })
        });
    }
}