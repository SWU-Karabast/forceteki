import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType, ZoneName } from '../../../core/Constants';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { Card } from '../../../core/card/Card';
import type { Player } from '../../../core/Player';

export default class AFineAddition extends EventCard {
    private unitsDefeatedWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7895170711',
            internalName: 'a-fine-addition',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    protected wasEnemyUnitDefeatedThisPhaseForPlayer(player: Player): boolean {
        return this.unitsDefeatedWatcher.someDefeatedUnitControlledByPlayer(player);
    }

    protected checkZoneAndOwnershipOfCard(card: Card, controllingPlayer: Player): boolean {
        // Any discard pile is valid, but only the players own hand is valid
        return card.zoneName === ZoneName.Discard || (card.zoneName === ZoneName.Hand && card.controller === controllingPlayer);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'If an enemy unit was defeated this phase, play an upgrade from your hand or from any player\'s discard pile, ignoring its aspect penalty.',
            targetResolver: {
                zoneFilter: [ZoneName.Discard, ZoneName.Hand],
                cardCondition: (card, context) => this.wasEnemyUnitDefeatedThisPhaseForPlayer(context.player.opponent) && this.checkZoneAndOwnershipOfCard(card, context.player),
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.target.zoneName === ZoneName.Discard,
                    onTrue: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                        canPlayFromAnyZone: true,
                        playAsType: WildcardCardType.Upgrade,
                    }),
                    onFalse: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.IgnoreAllAspects },
                        playAsType: WildcardCardType.Upgrade
                    }),
                })
            }
        });
    }
}

