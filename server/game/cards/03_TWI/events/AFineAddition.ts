import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { CardType, ZoneName } from '../../../core/Constants';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { Card } from '../../../core/card/Card';
import type Player from '../../../core/Player';

export default class AFineAddition extends EventCard {
    private unitsDefeatedWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7895170711',
            internalName: 'a-fine-addition',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    protected wasEnemyUnitDefeatedThisPhaseForPlayer(player: Player): boolean {
        return this.unitsDefeatedWatcher.getDefeatedUnitsControlledByPlayer(player).length >= 1;
    }

    protected checkZoneAndOwnershipOfCard(card: Card, controllingPlayer: Player): boolean {
        // Any discard pile is valid, but only the players own hand is valid
        return card.zoneName === ZoneName.Discard || (card.zoneName === ZoneName.Hand && card.controller === controllingPlayer);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'If an enemy unit was defeated this phase, play an upgrade from your hand or from any player\'s discard pile, ignoring its aspect penalty.',
            targetResolver: {
                cardTypeFilter: CardType.BasicUpgrade,
                zoneFilter: [ZoneName.Discard, ZoneName.Hand],
                cardCondition: (card, context) => this.wasEnemyUnitDefeatedThisPhaseForPlayer(context.source.controller.opponent) && this.checkZoneAndOwnershipOfCard(card, context.source.controller),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => {
                        return context.target.zoneName === ZoneName.Discard;
                    },
                    onTrue: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                        canPlayOpponentOwned: true
                    }),
                    onFalse: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects }
                    }),
                })
            }
        });
    }
}

AFineAddition.implemented = true;
