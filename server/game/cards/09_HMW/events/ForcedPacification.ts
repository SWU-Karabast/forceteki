import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import { EventResolutionStatus } from '../../../core/event/GameEvent';

export default class ForcedPacification extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6558799761',
            internalName: 'forced-pacification'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat any number of friendly units. For each friendly unit defeated this way, exhaust 2 enemy units.',
            targetResolver: {
                activePromptTitle: 'Defeat any number of friendly units',
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => {
                const defeatResolved = ifYouDoContext.events.filter((e) => e.name === EventName.OnCardDefeated && e.resolutionStatus === EventResolutionStatus.RESOLVED).length;
                const enemyUnitCount = ifYouDoContext.player.opponent.getArenaUnits().length;
                const exhaustCount = Math.min(defeatResolved * 2, enemyUnitCount);

                return ({
                    title: `Exhaust up to ${exhaustCount} enemy units`,
                    targetResolver: {
                        activePromptTitle: (_context, selectedCards) => (
                            selectedCards == null
                                ? `Exhaust ${exhaustCount} enemy units`
                                : `Exhaust ${exhaustCount} enemy units (${selectedCards.length} selected)`
                        ),
                        mode: TargetMode.Exactly,
                        numCards: exhaustCount,
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        immediateEffect: AbilityHelper.immediateEffects.exhaust()
                    }
                });
            }
        });
    }
}