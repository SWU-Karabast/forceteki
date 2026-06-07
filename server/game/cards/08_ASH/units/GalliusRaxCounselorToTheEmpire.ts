import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class GalliusRaxCounselorToTheEmpire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7588520146',
            internalName: 'gallius-rax#counselor-to-the-empire',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Other friendly units with 2 or more different keywords get +2/+2.',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.keywords.length > 1,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
        });
    }
}