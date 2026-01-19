import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BackedByTheHutts extends EventCard {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected override get overrideNotImplemented(): boolean {
        return true;
    }

    protected override getImplementationId () {
        return {
            id: 'backed-by-the-hutts-id',
            internalName: 'backed-by-the-hutts',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create a Credit token. You may deal damage to a unit equal to the number of friendly Credit tokens.',
            immediateEffect: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.createCreditToken(),
                abilityHelper.immediateEffects.optional({
                    title: 'Deal damage to a unit equal to the number of friendly Credit tokens',
                    innerSystem: abilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: context.player.creditTokenCount }))
                    })
                })
            ])
        });
    }
}