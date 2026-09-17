import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CloneOfTheZilloBeastEmperorsExperiment extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2558977875',
            internalName: 'clone-of-the-zillo-beast#emperors-experiment',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Other friendly units get -2/-2',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card.isUnit() && card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
        });

        registrar.addOnAttackAbility({
            title: 'Give a Weakness token to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveWeakness()
            }
        });
    }
}