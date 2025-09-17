import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';

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
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: CardType.BasicUpgrade,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    attachTargetCondition: (attachTarget) => attachTarget === context.source,
                    nested: true
                }))
            },
            then: () => this.thenPlayAnotherUpgrade(AbilityHelper)
        });
    }

    private thenPlayAnotherUpgrade(AbilityHelper: IAbilityHelper): IThenAbilityPropsWithSystems<TriggeredAbilityContext<this>> {
        return {
            title: 'Play another Upgrade from your discard pile on this unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.BasicUpgrade,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    attachTargetCondition: (attachTarget) => attachTarget === context.source,
                    nested: true
                }))
            },
            then: () => this.thenPlayAnotherUpgrade(AbilityHelper)
        };
    }
}