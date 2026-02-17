import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { IPlayableCard } from '../../../core/card/baseClasses/PlayableOrDeployableCard';

export default class VermillionQirasAuctionHouse extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '8437499257',
            internalName: 'vermillion#qiras-auction-house',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        // TSTODO: This wacky ability will be even wackier in Twin Suns
        registrar.addOnAttackCompletedAbility({
            title: 'Reveal the top card of a deck',
            targetResolver: {
                activePromptTitle: 'Reveal the top card of a deck',
                mode: TargetMode.Select,
                condition: (context) => AttackHelpers.attackerSurvived(
                    context.event.attack,
                    this.unitsDefeatedThisPhaseWatcher
                ),
                choices: (context) => ({
                    ['Your deck']: AbilityHelper.immediateEffects.reveal({
                        useDisplayPrompt: true,
                        target: context.player.getTopCardOfDeck(),
                    }),
                    ['Opponent\'s deck']: AbilityHelper.immediateEffects.reveal({
                        useDisplayPrompt: true,
                        target: context.player.opponent.getTopCardOfDeck(),
                    })
                })
            },
            then: (outerContext) => ({
                title: 'Choose a player',
                targetResolver: {
                    activePromptTitle: (_) => `Choose a player. That player may play ${this.getRevealedCard(outerContext).title} for free. If they do, the other player creates ${this.getRevealedCard(outerContext).cost} Credit tokens.`,
                    mode: TargetMode.Player
                },
                then: (innerContext) => ({
                    title: `Play ${this.getRevealedCard(outerContext).title} for free`,
                    optional: true,
                    canBeTriggeredBy: EnumHelpers.asRelativePlayer(innerContext.target, outerContext.player),
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        target: this.getRevealedCard(outerContext),
                        playAsType: WildcardCardType.Any,
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        canPlayFromAnyZone: true,
                    }),
                    ifYouDo: {
                        title: `Create ${this.getRevealedCard(outerContext).cost} Credit tokens`,
                        canBeTriggeredBy: EnumHelpers.asRelativePlayer(innerContext.target.opponent, outerContext.player),
                        immediateEffect: AbilityHelper.immediateEffects.createCreditToken({
                            amount: this.getRevealedCard(outerContext).cost,
                        })
                    }
                })
            })
        });
    }

    private getRevealedCard(context: AbilityContext): IPlayableCard {
        return context.events[0].card[0];
    }
}