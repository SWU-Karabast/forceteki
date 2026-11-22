import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';

export default class CloneCommanderCodyLoyaltoTheRepublic extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6942187067',
            internalName: 'clone-commander-cody#loyal-to-the-republic',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Experience token to it',
            when: {
                onUnitEntersPlay: (event, context) =>
                    event.card !== context.source &&
                    event.card.controller === context.player &&
                    event.card.hasSomeTrait(Trait.Republic)
            },
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                target: context.event.card
            }))
        });
    }
}