import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GarSaxonCovetingPower extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'gar-saxon#coveting-power-id',
            internalName: 'gar-saxon#coveting-power',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Create a Mandalorian token',
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.card.isUpgrade() && event.attachTarget === context.source
            },
            optional: true,
            limit: AbilityHelper.limit.perRound(1),
            immediateEffect: AbilityHelper.immediateEffects.createMandalorian()
        });
    }
}
