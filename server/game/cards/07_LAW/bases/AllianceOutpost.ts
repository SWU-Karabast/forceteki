import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { BaseCard } from '../../../core/card/BaseCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class AllianceOutpost extends BaseCard {
    protected override getImplementationId() {
        return {
            id: 'alliance-outpost-id',
            internalName: 'alliance-outpost',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'Give an Experience or Shield token to a unit, or create a Credit token',
            cost: AbilityHelper.costs.defeat({
                activePromptTitle: 'Choose a friendly token to defeat',
                cardTypeFilter: WildcardCardType.Token,
                controller: RelativePlayer.Self
            }),
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    ['Give Experience']: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Select a unit to give an Experience token',
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                    }),
                    ['Give Shield']: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Select a unit to give a Shield token',
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.giveShield()
                    }),
                    ['Create Credit']: AbilityHelper.immediateEffects.createCreditToken(),
                }
            }
        });
    }
}