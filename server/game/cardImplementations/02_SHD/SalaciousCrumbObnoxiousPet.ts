import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { CardType, Location, RelativePlayer } from '../../core/Constants';

export default class SalaciousCrumbObnoxiousPet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2744523125',
            internalName: 'salacious-crumb#obnoxious-pet'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Heal 1 damage from friendly base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                locationFilter: Location.Base,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 1 })
            }
        });

        this.addActionAbility({
            title: 'Deal 1 damage to a ground unit',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.returnSelfToHandFromPlay()
            ],
            targetResolver: {
                cardCondition: (card) => card.location === Location.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}

SalaciousCrumbObnoxiousPet.implemented = true;