import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ZamWesellNotWhatSheSeems extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0155971288',
            internalName: 'zam-wesell#not-what-she-seems'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `This unit gains each friendly leader's traits except ${TextHelper.Trait.Force}`,
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: AbilityHelper.ongoingEffects.gainTraits((target, context) => {
                const traits = new Set<Trait>();
                for (const leader of context.player.getLeaderCards()) {
                    for (const trait of leader.traits) {
                        if (trait !== Trait.Force) {
                            traits.add(trait);
                        }
                    }
                }
                return Array.from(traits);
            })
        });
    }
}
