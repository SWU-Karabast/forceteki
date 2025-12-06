import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class SoullessOneCustomizedForGrievous extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6406254252',
            internalName: 'soulless-one#customized-for-grievous',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust a friendly Droid unit or General Grievous. If you do, this unit gets +2/+0 for this attack',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) =>
                    card.controller === context.player &&
                    ((card.hasSomeTrait(Trait.Droid) && card.isUnit()) || card.title === 'General Grievous'),
                immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            },
            ifYouDo: {
                title: 'This unit gets +2/+0 for this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            },
        });
    }
}
