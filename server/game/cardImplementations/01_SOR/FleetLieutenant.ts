import AbilityDsl from '../../AbilityDsl';
import Card from '../../core/card/Card';
import { CardType, Location, RelativePlayer, Trait, WildcardLocation } from '../../core/Constants';

export default class FleetLieutenant extends Card {
    protected override getImplementationId() {
        return {
            id: '3038238423',
            internalName: 'fleet-lieutenant',
        };
    }

    override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Attack with a unit',
            target: {
                cardType: CardType.Unit,
                controller: RelativePlayer.Self,
                gameSystem: AbilityDsl.immediateEffects.conditional({
                    condition: (context) => context.target.hasTrait(Trait.Rebel),
                    trueGameAction: AbilityDsl.immediateEffects.attack(),
                    falseGameAction: AbilityDsl.immediateEffects.attack()
                })
            }
        });
    }
}

FleetLieutenant.implemented = true;