import AbilityHelper from '../../../../../server/game/AbilityHelper';
import { LeaderUnitCard } from '../../../../../server/game/core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, ZoneName } from '../../../../../server/game/core/Constants';
import { CostAdjustType } from '../../../../../server/game/core/cost/CostAdjuster';
import type { StateWatcherRegistrar } from '../../../../../server/game/core/stateWatcher/StateWatcherRegistrar';
import { setIntersection, setUnion } from '../../../../../server/game/core/utils/Helpers';
import type { AttacksThisPhaseWatcher } from '../../../../../server/game/stateWatchers/AttacksThisPhaseWatcher';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class MorganElsbethFollowingTheCall extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5045607736',
            internalName: 'morgan-elsbeth#following-the-call',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Choose a friendly unit that attacked this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly unit that attacked this phase',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => this.attacksThisPhaseWatcher.cardDidAttack(card)
                },
                playFromHand: {
                    activePromptTitle: 'Play a unit from you hand that shares a Keyword with the chosen unit',
                    dependsOn: 'friendlyUnit',
                    // TODO remove cardTypeFilter but fix Choose nothing button before
                    cardTypeFilter: CardType.BasicUnit,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    cardCondition: (card, context) => {
                        const cardKeywords = new Set(card.keywords.map((keyword) => keyword.name));
                        const targetKeywords = new Set(context.targets.friendlyUnit.keywords.map((keyword) => keyword.name));

                        return setIntersection(cardKeywords, targetKeywords).size > 0;
                    },
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                        playAsType: WildcardCardType.Unit
                    })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'The next unit you play this phase costs 1 resource less if it shares a Keyword with a friendly unit.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    limit: AbilityLimit.perPlayerPerGame(1),
                    amount: (card, player) => {
                        const cardKeywords = new Set(card.keywords.map((keyword) => keyword.name));
                        const inPlayKeywords = player.getArenaUnits()
                            .reduce((keywords, unit) => {
                                const unitKeywords = new Set(unit.keywords.map((keyword) => keyword.name));
                                return setUnion(keywords, unitKeywords);
                            }, new Set<string>());

                        return setIntersection(cardKeywords, inPlayKeywords).size > 0 ? 1 : 0;
                    },
                })
            })
        });
    }
}