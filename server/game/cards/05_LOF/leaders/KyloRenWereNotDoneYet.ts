import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class KyloRenWereNotDoneYet extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5174764156',
            internalName: 'kylo-ren#were-not-done-yet',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Discard a card from your hand. If you discard an Upgrade this way, draw a card',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                canChooseNoCards: false,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
            },
            ifYouDo: {
                title: 'If you discarded an Upgrade this way, draw a card',
                ifYouDoCondition: (context) => context.events[0].card.isUpgrade(),
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Play any number of Upgrades from your discard pile on this unit',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.playMultipleCardsFromDiscard({
                cardTypeFilter: CardType.BasicUpgrade,
                playAsType: WildcardCardType.Upgrade,
                attachTargetCondition: (attachTarget, context) => attachTarget === context.source,
            })
        });
    }
}