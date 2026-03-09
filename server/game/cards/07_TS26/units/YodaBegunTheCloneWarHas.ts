import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class YodaBegunTheCloneWarHas extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8997739660',
            internalName: 'yoda#begun-the-clone-war-has',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'If you control 7 or more resources, this unit costs 2 resources less to play',
            condition: (context) => context.player.resources.length >= 7,
            amount: 2
        });

        registrar.addTriggeredAbility({
            title: 'Create a Clone Trooper token and give it Sentinel for this phase',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: abilityHelper.immediateEffects.createCloneTrooper((context) => ({ amount: 1, target: context.player })),
            then: (thenContext) => ({
                title: 'Give it Sentinel for this phase',
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel }),
                    target: thenContext.events[0].generatedTokens
                })
            })
        });
    }
}