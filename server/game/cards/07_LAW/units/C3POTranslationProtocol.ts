import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class C3POTranslationProtocol extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4459586752',
            internalName: 'c3po#translation-protocol'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give an Experience token to another non-leader unit that shares a Trait with a friendly leader',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source && card.isNonLeaderUnit() && card.hasSomeTrait(context.player.leader.traits),
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}