import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';

export default class KelnaccaSolitaryMaster extends NonLeaderUnitCard {
    private cardsLeftPlayThisPhase: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7621020577',
            internalName: 'kelnacca#solitary-master',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsLeftPlayThisPhase = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase();
    }

    /**
     * This unit's power for its When Played ability. If the unit has left play before the ability resolves (the copy just played was
     * defeated by the uniqueness rule) it is the power it had when it left play (last known information), as for Latts Razzi.
     */
    private getPowerOf(source: IUnitCard): number {
        if (source.isInPlay()) {
            return source.getPower();
        }

        const mostRecentCopy = this.cardsLeftPlayThisPhase.getCurrentValue().find((x) => x.card === source && x.inPlayId === source.mostRecentInPlayId);
        return mostRecentCopy.lastKnownInformation.power;
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Pay any number of resources. For every 3 resources paid this way, deal damage equal to this unit\'s power to an enemy unit',
            contextTitle: (context) => `Pay any number of resources. For every 3 resources paid this way, deal ${this.getPowerOf(context.source)} damage to an enemy unit`,
            targetResolver: {
                mode: TargetMode.ChooseNumber,
                min: 0,
                max: (context) => context.player.readyResourceCount,
                immediateEffect: AbilityHelper.immediateEffects.payResourcesWithoutAdjustment((context) => ({
                    amount: parseInt(context.select),
                    target: context.player
                })),
            },
            then: (thenContext) => {
                const damageInstances = Math.floor(parseInt(thenContext.select) / 3);
                const sourcePower = this.getPowerOf(thenContext.source);
                return {
                    title: `Deal ${sourcePower} damage to an enemy unit`,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                        Array.from({ length: damageInstances }, (_, i) =>
                            AbilityHelper.immediateEffects.selectCard({
                                activePromptTitle: `Deal ${sourcePower} damage to an enemy unit (${i + 1}/${damageInstances})`,
                                cardTypeFilter: WildcardCardType.Unit,
                                controller: RelativePlayer.Opponent,
                                immediateEffect: AbilityHelper.immediateEffects.damage({
                                    amount: sourcePower,
                                })
                            })
                        )
                    )
                };
            }
        });
    }
}
