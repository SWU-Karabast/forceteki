import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, RelativePlayer } from '../../../core/Constants';

export default class DarthVaderUselessToResist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-vader#useless-to-resist-id',
            internalName: 'darth-vader#useless-to-resist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly unit gains Ambush',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}