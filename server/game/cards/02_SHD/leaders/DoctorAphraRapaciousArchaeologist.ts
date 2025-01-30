import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName, RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class DoctorAphraRapaciousArchaeologist extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0254929700',
            internalName: 'doctor-aphra#rapacious-archaeologist',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Discard a card from your deck',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.source.controller
            })),
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'While there are 5 or more different costs among cards in your discard pile, this unit gets +3/+0',
            condition: (context) => new Set(
                context.source.controller.getCardsInZone(ZoneName.Discard).filter((card) => card.hasCost())
                    .map((card) => card.cost)
            ).size >= 5,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
        });
        this.addTriggeredAbility({
            title: 'Choose 3 cards in your discard pile with different names. If you do, return 1 of them at random to your hand',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source,
            },
            targetResolver: {
                mode: TargetMode.Exactly,
                numCards: 3,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                multiSelectCardCondition: (card, selectedCards) => selectedCards.every((selectedCard) => selectedCard.title !== card.title),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => ({
                    target: Helpers.randomItem(Helpers.asArray(context.target), context.game.randomGenerator),
                })),
            },
        });
    }
}
