import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class TheyHateThatShip extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7461173274',
            internalName: 'they-hate-that-ship',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'An opponent creates 2 TIE Fighter tokens and readies them',
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter((context) => ({
                entersReady: true,
                amount: 2,
                target: context.player.opponent
            })),
            then: {
                title: 'Play a Vehicle unit from your hand. It costs 3 resources less',
                targetResolver: {
                    zoneFilter: ZoneName.Hand,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 3 },
                        playAsType: WildcardCardType.Unit,
                    }),
                },
            }
        });
    }
}

