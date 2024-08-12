import AbilityDsl from '../../AbilityDsl';
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

    override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Attack with a unit',
            // cannotTargetFirst: true,
            initiateAttack: (context: AbilityContext) => ({
                effects: (context: AbilityContext, attack: Attack) => {
                    if (attack.attacker.hasTrait(Trait.Rebel)) {
                        return {
                            target: attack.attacker,
                            effect: AbilityDsl.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                        };
                    }
                    return null;
                }
            })
        });
    }
}

FleetLieutenant.implemented = false;