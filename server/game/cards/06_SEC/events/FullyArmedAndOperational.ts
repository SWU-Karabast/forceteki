import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { CardType, KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';
import type { ActionsThisPhaseWatcher } from '../../../stateWatchers/ActionsThisPhaseWatcher';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class FullyArmedAndOperational extends EventCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;
    private actionsThisPhaseWatcher: ActionsThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5736131351',
            internalName: 'fully-armed-and-operational',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
        this.actionsThisPhaseWatcher = AbilityHelper.stateWatchers.actionsThisPhase();
    }

    public override setupCardAbilities(
        registrar: IEventAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.setEventAbility({
            title: 'If an opponent attacked your base during their previous action this phase, play a unit from your hand. Give it Ambush for this phase.',
            // cannotTargetFirst: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: this.opponentDidAttackBaseLastAction(context),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    // activePromptTitle: 'Play a unit from your hand. Give it ambush for this phase',
                    cardTypeFilter: CardType.BasicUnit,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                        gameSystems: [
                            AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                            AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                            }),
                        ],
                        resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                    })
                })
            }))
        });
    }

    private opponentDidAttackBaseLastAction(context: AbilityContext): boolean {
        const opponentsLastActionNumber = this.actionsThisPhaseWatcher.previousActionNumberForPlayer(context.player.opponent);

        if (opponentsLastActionNumber === null) {
            return false;
        }

        const entry = this.attacksThisPhaseWatcher.getCurrentValue()
            .find((entry) =>
                entry.actionNumber === opponentsLastActionNumber &&
                entry.attackingPlayer === context.player.opponent &&
                entry.targets.some((target) => target.isBase())
            );

        return !!entry;
    }
}