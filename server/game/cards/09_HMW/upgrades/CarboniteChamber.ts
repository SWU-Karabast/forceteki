import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { AbilityRestriction, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class CarboniteChamber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'carbonite-chamber-id',
            internalName: 'carbonite-chamber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Choose a non-${TextHelper.Trait.Vehicle} unit. It doesn't ready during the next regroup phase`,
            cost: [abilityHelper.costs.defeatSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: abilityHelper.immediateEffects.forThisRoundCardEffect({
                    effect: abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.DoesNotReadyDuringRegroup),
                    ongoingEffectDescription: 'prevent {0} from readying',
                })
            },
        });
    }
}
