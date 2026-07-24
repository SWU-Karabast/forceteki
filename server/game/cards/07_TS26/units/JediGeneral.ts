import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class JediGeneral extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5760795689',
            internalName: 'jedi-general',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `For each ${TextHelper.Trait.Republic} leader you control, create a Clone Trooper and give an Experience token to it`,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                // Count every Republic leader in play (undeployed, deployed, or made a leader by an
                // upgrade like The Darksaber), so the effect scales in TwinSuns (two leaders) and when
                // extra leaders are created — not just a single trooper.
                condition: (context) => this.republicLeaderCount(context) > 0,
                onTrue: abilityHelper.immediateEffects.createCloneTrooper((context) => ({ amount: this.republicLeaderCount(context) })),
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give each created token an Experience token',
                immediateEffect: abilityHelper.immediateEffects.giveExperience({
                    target: ifYouDoContext.resolvedEvents[0]?.generatedTokens,
                })
            }),
        });
    }

    private republicLeaderCount(context: AbilityContext): number {
        return context.player.getLeaderCards({ trait: Trait.Republic }).length;
    }
}