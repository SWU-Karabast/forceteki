import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName, RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class DoctorAphraRapaciousArchaeologist extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0254929700',
            internalName: 'doctor-aphra#rapacious-archaeologist',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Discard a card from your deck',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While there are 5 or more different costs among cards in your discard pile, this unit gets +3/+0',
            condition: (context) => new Set(
                context.player.getCardsInZone(ZoneName.Discard).filter((card) => card.hasCost())
                    .map((card) => card.cost)
            ).size >= 5,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
        });
        registrar.addTriggeredAbility({
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
                immediateEffect: AbilityHelper.immediateEffects.randomSelection({
                    innerSystem: AbilityHelper.immediateEffects.returnToHand(),
                })
            },
        });
    }
}
