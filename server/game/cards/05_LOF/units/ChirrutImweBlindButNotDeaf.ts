import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChirrutImweBlindButNotDeaf extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0775347605',
            internalName: 'chirrut-imwe#blind-but-not-deaf'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Use the Force to give -2/-0 to the attacker for this attack',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give -2/-0 to the attacker for this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    target: ifYouDoContext.event.attack.attacker,
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 }),
                }),
            }),
        });
    }
}
