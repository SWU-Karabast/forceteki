import AbilityHelper from '../../AbilityHelper';
import { AbilityContext } from '../../core/ability/AbilityContext';
import { Attack } from '../../core/attack/Attack';
import { UnitCard } from '../../core/card/UnitCard';
import { Trait } from '../../core/Constants';

export default class FleetLieutenant extends UnitCard {
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

    // TODO: make this its own effect in the library (along with snowtrooper)
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