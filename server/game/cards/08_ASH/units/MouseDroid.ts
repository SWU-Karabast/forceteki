import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MouseDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2588977937',
            internalName: 'mouse-droid',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `The next unit Imperial you play this phase costs ${TextHelper.resource(1)} less`,
            immediateEffect: abilityHelper.immediateEffects.forThisPhasePlayerEffect({
                ongoingEffectDescription: 'discount the next Imperial unit played by',
                ongoingEffectTargetDescription: 'them',
                effect: abilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    match: (card) => card.hasSomeTrait(Trait.Imperial),
                    limit: abilityHelper.limit.perPlayerPerGame(1),
                    amount: 1
                })
            }),
        });
    }
}