
import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class ArmedToTheTeeth extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1938453783',
            internalName: 'armed-to-the-teeth',
        };
    }

    // public override setupCardAbilities() {
    //     this.addWhenPlayedAbility({
    //         title: 'Attack with attached unit',
    //         optional: false,
    //         immediateEffect: AbilityHelper.immediateEffects.attack((context) => ({
    //             attacker: context.source.parentCard
    //         }))
    //     });
    // }
}

ArmedToTheTeeth.implemented = false;//TODO: On Attack once shorthand code is done