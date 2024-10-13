import AbilityHelper from '../../../AbilityHelper';
import { Attack } from '../../../core/attack/Attack';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class IncineratorTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4328408486',
            internalName: 'incinerator-trooper',
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While attacking, this unit deals combat damage before the defender.',
            ongoingEffect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
        });
    }
}

IncineratorTrooper.implemented = true;
