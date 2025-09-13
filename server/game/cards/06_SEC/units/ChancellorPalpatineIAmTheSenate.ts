import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, KeywordName } from '../../../core/Constants';

export default class ChancellorPalpatineIAmTheSenate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7936097828',
            internalName: 'chancellor-palpatine#i-am-the-senate',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you control a leader unit, create 2 Spy tokens and give those tokens Sentinel for this phase',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isLeaderUnit() }),
                onTrue: abilityHelper.immediateEffects.createSpy({ amount: 2 }),
            }),
            then: (thenContext) => ({
                title: 'Give those tokens Sentinel for this phase',
                thenCondition: () => {
                    if (thenContext.events && thenContext.events.length > 0) {
                        const { name, isResolved, player } = thenContext.events[0];
                        return player === thenContext.player && name === EventName.OnTokensCreated && isResolved;
                    }
                    return false;
                },
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((_) => ({
                    target: thenContext.events[0].generatedTokens,
                    effect: abilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Sentinel,
                    })
                }))
            }),
        });
    }
}
