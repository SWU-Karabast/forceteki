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
        this.triggeredAbility({
            title: 'Heal 1 damage from friendly base',
            when: {
                onUnitEntersPlay: (event) => event.card === this
            },
            target: {
                // UP NEXT: add a contract check if location and cardType are mutually exclusive
                cardType: CardType.Base,
                location: Location.Base,
                controller: RelativePlayer.Self,
                gameSystem: AbilityDsl.immediateEffects.heal({ amount: 1 })
            }
        });
    }
}

SalaciousCrumbObnoxiousPet.implemented = false;