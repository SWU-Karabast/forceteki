import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { Card } from '../../../core/card/Card';
import type { AbilityContext } from '../../../core/ability/AbilityContext';

export default class OneMustDestroyToCreate extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'one-must-destroy-to-create-id',
            internalName: 'one-must-destroy-to-create',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a friendly non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            then: (thenContext) => ({
                title: `Play ${this.getTarget(thenContext)?.title} from your discard pile for free`,
                optional: true,
                thenCondition: (context) =>
                    this.getTarget(thenContext)?.zone === context.player.discardZone,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    target: this.getTarget(thenContext),
                    playAsType: WildcardCardType.Unit,
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    nested: true
                })
            })
        });
    }

    private getTarget(context?: AbilityContext<Card>): Card | undefined {
        if (!context) {
            return undefined;
        }
        return context.events.find((event) => event.name === EventName.OnCardDefeated)?.card;
    }
}