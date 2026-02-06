import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, Conjunction, TargetMode, WildcardCardType } from '../../../core/Constants';
import { aspectString } from '../../../core/utils/EnumHelpers';

export default class TheGhostHomeOfTheSpectres extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8641698344',
            internalName: 'the-ghost#home-of-the-spectres',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Give an Experience token and a Shield token to a unit. If you control a ${aspectString([Aspect.Vigilance, Aspect.Aggression], Conjunction.Or)} unit, you may give an Experience token and a Shield token to each of up to 2 units instead.`,
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isAspectInPlay([Aspect.Vigilance, Aspect.Aggression]),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give an Experience token and a Shield token to up to 2 units',
                    mode: TargetMode.UpTo,
                    numCards: 2,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.giveExperience(),
                        AbilityHelper.immediateEffects.giveShield()
                    ])
                }),
                onFalse: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give an Experience token and a Shield token to a unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.giveExperience(),
                        AbilityHelper.immediateEffects.giveShield()
                    ])
                }),
            })
        });
    }
}