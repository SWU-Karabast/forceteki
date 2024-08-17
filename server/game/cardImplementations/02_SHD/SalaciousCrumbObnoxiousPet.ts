import AbilityHelper from '../../AbilityHelper';
import Card from '../../core/card/Card';
import { CardType, Location, RelativePlayer } from '../../core/Constants';

export default class SalaciousCrumbObnoxiousPet extends Card {
    protected override getImplementationId() {
        return {
            id: '2744523125',
            internalName: 'salacious-crumb#obnoxious-pet'
        };
    }

    public override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Heal 1 damage from friendly base',
            targetResolver: {
                cardType: CardType.Base,
                locationFilter: Location.Base,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 1 })
            }
        });

        this.actionAbility({
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