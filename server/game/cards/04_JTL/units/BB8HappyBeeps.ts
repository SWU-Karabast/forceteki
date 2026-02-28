import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, Trait, WildcardCardType } from '../../../core/Constants';

export default class BB8HappyBeeps extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2283726359',
            internalName: 'bb8#happy-beeps',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            type: AbilityType.Triggered,
            when: {
                whenPlayed: true,
            },
            title: 'Pay 2 resources to ready a Resistance unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResources((context) => ({
                amount: 2,
                target: context.player
            })),
            ifYouDo: {
                title: 'Ready a Resistance unit',
                targetResolver: {
                    activePromptTitle: 'Choose a Resistance unit to ready',
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Resistance),
                    immediateEffect: AbilityHelper.immediateEffects.ready()
                }
            }
        });
    }
}