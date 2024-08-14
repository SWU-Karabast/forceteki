import AbilityDsl from '../../AbilityDsl';
import { AbilityContext } from '../../core/ability/AbilityContext';
import { Attack } from '../../core/attack/Attack';
import Card from '../../core/card/Card';
import { Trait } from '../../core/Constants';

export default class FleetLieutenant extends Card {
    protected override getImplementationId() {
        return {
            id: '9097690846',
            internalName: 'snowtrooper-lieutenant'
        };
    }

    override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                effects: this.rebelPowerBuffEffectGenerator
            }
        });
    }

    private rebelPowerBuffEffectGenerator(context: AbilityContext, attack: Attack) {
        if (attack.attacker.hasTrait(Trait.Imperial)) {
            return {
                target: attack.attacker,
                effect: AbilityDsl.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
            };
        }
        return null;
    }
}

FleetLieutenant.implemented = true;