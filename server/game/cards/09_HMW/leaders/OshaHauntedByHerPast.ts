import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { IIfYouDoAbilityPropsWithSystems } from '../../../Interfaces';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class OshaHauntedByHerPast extends LeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'osha#haunted-by-her-past-id',
            internalName: 'osha#haunted-by-her-past'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `If a friendly ${TextHelper.Heroism} unit was defeated this phase, play a ${TextHelper.Villainy} unit from your resources, ignoring its ${TextHelper.Villainy} aspect penalties`,
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                activePromptTitle: `Choose a ${TextHelper.Villainy} unit to play from your resources`,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Resource,
                cardCondition: (card, _) => card.hasSomeAspect(Aspect.Villainy),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.friendlyHeroismUnitDefeatedThisPhase(context),
                    onTrue: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        playAsType: WildcardCardType.Unit,
                        canPlayFromAnyZone: true,
                        nested: true,
                        adjustCost: {
                            costAdjustType: CostAdjustType.IgnoreSpecificAspects,
                            ignoredAspect: Aspect.Villainy
                        },
                    })
                })
            },
            ifYouDo: this.buildResourceCardFromHandIfYouDo(AbilityHelper)
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Play a ${TextHelper.Villainy} unit from your resources, ignoring its ${TextHelper.Villainy} aspect penalties`,
            targetResolver: {
                activePromptTitle: `Choose a ${TextHelper.Villainy} unit to play from your resources`,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Resource,
                cardCondition: (card, _) => card.hasSomeAspect(Aspect.Villainy),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    playAsType: WildcardCardType.Unit,
                    canPlayFromAnyZone: true,
                    nested: true,
                    adjustCost: {
                        costAdjustType: CostAdjustType.IgnoreSpecificAspects,
                        ignoredAspect: Aspect.Villainy
                    },
                })
            },
            ifYouDo: this.buildResourceCardFromHandIfYouDo(AbilityHelper)
        });
    }

    private friendlyHeroismUnitDefeatedThisPhase<TSource extends Card>(context: AbilityContext<TSource>): boolean {
        return this.cardsDefeatedThisPhaseWatcher.someUnitDefeatedThisPhase((entry) =>
            entry.controlledBy === context.player &&
            entry.card.hasSomeAspect(Aspect.Heroism)
        );
    }

    private buildResourceCardFromHandIfYouDo(AbilityHelper: IAbilityHelper): IIfYouDoAbilityPropsWithSystems<TriggeredAbilityContext<this>> {
        return {
            title: 'Resource a card from your hand',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.resourceCard()
            }
        };
    }
}
