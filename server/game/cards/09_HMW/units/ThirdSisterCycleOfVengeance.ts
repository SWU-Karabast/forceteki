import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class ThirdSisterCycleOfVengeance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'third-sister#cycle-of-vengeance-id',
            internalName: 'third-sister#cycle-of-vengeance',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: WildcardRelativePlayer.Any,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            },
            ifYouDo: (step1Context) => {
                const step1Controller = step1Context.events[0].lastKnownInformation?.controller ?? step1Context.target.controller;
                return {
                    title: 'Deal 3 damage to a unit',
                    optional: true,
                    canBeTriggeredBy: EnumHelpers.asRelativePlayer(step1Context.player, step1Controller),
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: WildcardRelativePlayer.Any,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                    },
                    ifYouDo: (step2Context) => {
                        const step2Controller = step2Context.events[0].lastKnownInformation?.controller ?? step2Context.target.controller;
                        return {
                            title: 'Deal 4 damage to a unit',
                            optional: true,
                            canBeTriggeredBy: EnumHelpers.asRelativePlayer(step2Context.player, step2Controller),
                            targetResolver: {
                                cardTypeFilter: WildcardCardType.Unit,
                                controller: WildcardRelativePlayer.Any,
                                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 4 })
                            }
                        };
                    }
                };
            }
        });
    }
}
