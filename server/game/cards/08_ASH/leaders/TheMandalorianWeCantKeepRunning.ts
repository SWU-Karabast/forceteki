import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheMandalorianWeCantKeepRunning extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-mandalorian#we-cant-keep-running-id',
            internalName: 'the-mandalorian#we-cant-keep-running',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Pay ${TextHelper.resource(1)} to draw a card`,
            optional: true,
            when: {
                onClaimInitiative: (event, context) => event.player === context.player,
            },
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.payResources({ amount: 1 }),
            },
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: abilityHelper.immediateEffects.draw(),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasInitiative(),
                onTrue: abilityHelper.immediateEffects.draw()
            })
        });
    }
}
