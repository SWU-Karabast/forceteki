import AbilityHelper from '../../../AbilityHelper';
import { Attack } from '../../../core/attack/Attack';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class HanSoloReluctantHero extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9500514827',
            internalName: 'han-solo#reluctant-hero',
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While attacking, this unit deals combat damage before the defender.',
            ongoingEffect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender(),
        });
    }
}

HanSoloReluctantHero.implemented = true;
