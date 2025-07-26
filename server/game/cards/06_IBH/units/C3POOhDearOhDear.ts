import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class C3POOhDearOhDear extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2404973143',
            internalName: 'c3po#oh-dear-oh-dear',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you control a Cunning unit, draw a card',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ aspect: Aspect.Cunning }),
                onTrue: abilityHelper.immediateEffects.draw()
            })
        });
    }
}