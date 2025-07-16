import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class EzraBridgerAttunedWithLife extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0726963200',
            internalName: 'ezra-bridger#attuned-with-life',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Give an Experience token to another Creature or Spectre unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait([Trait.Creature, Trait.Spectre]),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
