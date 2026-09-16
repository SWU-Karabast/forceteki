import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { EventName, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class AlwaysABiggerFish extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'always-a-bigger-fish-id',
            internalName: 'always-a-bigger-fish',
        };
    }

    // Defeat a friendly Creature unit. If you do, play a Creature unit that costs up to 3 more than the defeated unit from your hand for free
    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Defeat a friendly ${TextHelper.Trait.Creature} unit`,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Creature),
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => {
                const defeatedUnitCost = ifYouDoContext.events.find((event) => event.name === EventName.OnCardDefeated)?.lastKnownInformation?.cost ?? 0;
                return {
                    title: `Play a ${TextHelper.Trait.Creature} unit that costs up to ${TextHelper.resource(defeatedUnitCost + 3)} from your hand for free`,
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: ZoneName.Hand,
                        controller: RelativePlayer.Self,
                        cardCondition: (card) => card.hasSomeTrait(Trait.Creature) && card.hasCost() && card.cost <= defeatedUnitCost + 3,
                        immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                            playAsType: WildcardCardType.Unit,
                            adjustCost: { costAdjustType: CostAdjustType.Free }
                        })
                    }
                };
            }
        });
    }
}
