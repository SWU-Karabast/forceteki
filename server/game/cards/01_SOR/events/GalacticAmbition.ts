import { EventCard } from '../../../core/card/EventCard';
import { Aspect, CardType, Location, RelativePlayer } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class GalacticAmbition extends EventCard {
    protected override getImplementationId () {
        return {
            id: '5494760041',
            internalName: 'galactic-ambition',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Play a non-Heroism unit from your hand for free. Deal damage to your base equal to its cost.',
            targetResolvers: {
                playedUnit: {
                    locationFilter: Location.Hand,
                    cardTypeFilter: CardType.BasicUnit,
                    cardCondition: (card) => !card.hasSomeAspect(Aspect.Heroism),
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                        costAdjusterProperties: {
                            costAdjustType: CostAdjustType.Free
                        }
                    })
                },
                damagedBase: {
                    dependsOn: 'playedUnit',
                    cardTypeFilter: CardType.Base,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: context.targets.playedUnit.printedCost }))
                }
            }
        });
    }
}

GalacticAmbition.implemented = true;
