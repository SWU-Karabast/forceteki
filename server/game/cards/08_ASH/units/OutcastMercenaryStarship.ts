import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class OutcastMercenaryStarship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5394891260',
            internalName: 'outcast#mercenary-starship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give the entering unit +1/+0 for this phase',
            when: {
                onUnitEntersPlay: (event, context) => event.card.controller === context.player,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.event.card,
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
            })),
        });
    }
}
