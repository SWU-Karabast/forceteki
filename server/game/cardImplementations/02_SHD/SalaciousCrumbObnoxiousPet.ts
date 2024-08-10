import AbilityDsl from '../../AbilityDsl';
import Card from '../../core/card/Card';
import { CardType, Location, RelativePlayer } from '../../core/Constants';

export default class SalaciousCrumbObnoxiousPet extends Card {
    protected override getImplementationId() {
        return {
            id: '2744523125',
            internalName: 'salacious-crumb#obnoxious-pet'
        };
    }

    override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Heal 1 damage from friendly base',
            target: {
                // UP NEXT: add a contract check if location and cardType are mutually exclusive
                cardType: CardType.Base,
                location: Location.Base,
                controller: RelativePlayer.Self,
                gameSystem: AbilityDsl.immediateEffects.heal({ amount: 1 })
            }
        });

        this.actionAbility({
            title: 'Deal 1 damage to a ground unit',
            cost: [
                AbilityDsl.costs.exhaustSelf(),
                AbilityDsl.costs.returnSelfToHandFromPlay()
            ],
            target: {
                cardCondition: (card) => card.location === Location.GroundArena,
                gameSystem: AbilityDsl.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}

SalaciousCrumbObnoxiousPet.implemented = true;