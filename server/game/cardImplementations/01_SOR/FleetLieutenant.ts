import AbilityHelper from '../../AbilityHelper';
import { AbilityContext } from '../../core/ability/AbilityContext';
import { Attack } from '../../core/attack/Attack';
import Card from '../../core/card/Card';
import { Trait } from '../../core/Constants';

export default class FleetLieutenant extends Card {
    protected override getImplementationId() {
        return {
            id: '3038238423',
            internalName: 'fleet-lieutenant',
        };
    }

    protected override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                effects: this.rebelPowerBuffEffectGenerator
            }
        });
    }

    private rebelPowerBuffEffectGenerator(context: AbilityContext, attack: Attack) {
        if (attack.attacker.hasTrait(Trait.Rebel)) {
            return {
                target: attack.attacker,
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
            };
        }
        return null;
    }
}

FleetLieutenant.implemented = true;