import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class EethKothSpiritualWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'eeth-koth#spiritual-warrior-id',
            internalName: 'eeth-koth#spiritual-warrior',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Use the Force to put Eeth Koth into play as a resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Put Eeth Koth into play as a resource',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source }))
            }
        });
    }
}