import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { INonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class OldDakaOldestAndWisest extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0564229530',
            internalName: 'old-daka#oldest-and-wisest',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a friendly Night unit not named Old Daka',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Night) && card.title !== 'Old Daka',
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
                    adjustCost: { costAdjustType: CostAdjustType.Free }
                })
            })
        });
    }

    private getTarget?(context: AbilityContext<INonLeaderUnitCard>): Card {
        return context.events.find((event) => event.name === EventName.OnCardDefeated)?.card;
    }
}

