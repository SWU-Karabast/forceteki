import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class PadmeAmidalaWithGreatPleasure extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4366601154',
            internalName: 'padme-amidala#with-great-pleasure',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Other friendly ${TextHelper.Heroism} units get +3/+3`,
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 3 })
        });
    }
}