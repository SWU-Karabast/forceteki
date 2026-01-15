import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class PhantomSpectreShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'phantom#spectre-shuttle-id',
            internalName: 'phantom#spectre-shuttle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Play a Heroism unit from you hand and give an Experience token to it',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
                zoneFilter: ZoneName.Hand,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.playCardFromHand({
                        playAsType: WildcardCardType.Unit,
                    }),
                    abilityHelper.immediateEffects.giveExperience((context) => ({ target: context.target }))
                ]),
            }
        });
    }
}