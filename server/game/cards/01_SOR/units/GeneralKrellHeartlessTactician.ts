import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer } from '../../../core/Constants';

export default class GeneralKrellHeartlessTactician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9353672706',
            internalName: 'general-krell#heartless-tactician',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Other friendly units gain when defeated ability',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                type: AbilityType.Triggered,
                title: 'Draw a card',
                optional: true,
                when: { whenDefeated: true },
                immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
            })
        });
    }
}
