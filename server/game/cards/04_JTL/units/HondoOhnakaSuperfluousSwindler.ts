import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class HondoOhnakaSuperfluousSwindler extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2644994192',
            internalName: 'hondo-ohnaka#superfluous-swindler',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Take control of a non-Pilot upgrade on a unit and attach it to a different eligible unit',
            optional: true,
            targetResolvers: {
                upgrade: {
                    activePromptTitle: 'Choose a non-Pilot upgrade to take control of',
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Upgrade,
                    cardCondition: (card) => !card.hasSomeTrait(Trait.Pilot),
                },
                unit: {
                    dependsOn: 'upgrade',
                    activePromptTitle: 'Choose a different unit to attach the upgrade to',
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card, context) =>
                        context.targets.upgrade.isUpgrade() &&
                        card !== context.targets.upgrade.parentCard &&
                        context.targets.upgrade.canAttach(card, context, context.player),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        newController: RelativePlayer.Self,
                        upgrade: context.targets.upgrade,
                        target: context.targets.unit,
                    }))
                }
            }
        });
    }
}