import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, KeywordName } from '../../../core/Constants';

export default class ChancellorPalpatineIAmTheSenate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7936097828',
            internalName: 'chancellor-palpatine#i-am-the-senate',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create 2 Spy tokens and give those tokens Sentinel for this phase',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaCard({ type: CardType.LeaderUnit }),
                onTrue: abilityHelper.immediateEffects.createSpy({ amount: 2 }),
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give those tokens Sentinel for this phase',
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    target: ifYouDoContext.events[0].generatedTokens,
                    effect: abilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Sentinel,
                    })
                })
            }),
        });
    }
}
