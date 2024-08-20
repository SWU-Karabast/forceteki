import AbilityHelper from '../../AbilityHelper';
import { AbilityContext } from '../../core/ability/AbilityContext';
import { Attack } from '../../core/attack/Attack';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Trait } from '../../core/Constants';

export default class SnowtrooperLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9097690846',
            internalName: 'snowtrooper-lieutenant'
        };
    }

    public override setupCardAbilities() {
        this.whenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                effects: this.imperialPowerBuffEffectGenerator
            }
        });
    }

    private imperialPowerBuffEffectGenerator(context: AbilityContext, attack: Attack) {
        if (attack.attacker.hasTrait(Trait.Imperial)) {
            return {
                target: attack.attacker,
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
            };
        }
        return null;
    }
}

SnowtrooperLieutenant.implemented = true;