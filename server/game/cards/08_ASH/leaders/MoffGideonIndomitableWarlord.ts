import type { IAbilityHelper } from '../../../AbilityHelper';
import * as KeywordHelpers from '../../../core/ability/KeywordHelpers';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { NonParameterKeywordName } from '../../../Interfaces';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class MoffGideonIndomitableWarlord extends LeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3621912835',
            internalName: 'moff-gideon#indomitable-warlord',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = abilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: `Play a unit from your hand. It costs ${TextHelper.resource(1)} less.`,
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => this.friendlyImperialUnitWasDefeatedThisPhase(context),
                    onTrue: abilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                        playAsType: WildcardCardType.Unit
                    })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Ambush);
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Grit);
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Hidden);
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Overwhelm);
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Saboteur);
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Sentinel);
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Shielded);
        this.addKeywordCopyAbility(registrar, abilityHelper, KeywordName.Support);
    }

    private friendlyImperialUnitWasDefeatedThisPhase(context): boolean {
        return this.cardsDefeatedThisPhaseWatcher.someUnitDefeatedThisPhase((entry) =>
            entry.controlledBy === context.player &&
            entry.lastKnownInformation.traits.has(Trait.Imperial)
        );
    }

    private addKeywordCopyAbility(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper, keyword: NonParameterKeywordName) {
        registrar.addConstantAbility({
            title: `This unit gains ${KeywordHelpers.keywordDescription(keyword)} if it is on an ${TextHelper.Trait.Imperial} unit in your discard pile`,
            condition: (context) => context.player.discard.some((x) =>
                x.isUnit() && x.hasSomeTrait(Trait.Imperial) && x.hasSomeKeyword(keyword)
            ),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: keyword })
        });
    }
}
