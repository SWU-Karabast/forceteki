import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KraganGorrWarbirdCaptain extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7674544152',
            internalName: 'kragan-gorr#warbird-captain'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give a Shield token to a friendly unit in the same arena as the attacker',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.player.base),
            },
            targetResolver: {
                // TODO: update this to use last known state (once implemented) to get attacker zone in case it's defeated
                cardCondition: (card, context) => card.controller === context.player && card.zoneName === context.event.attack.attacker.zoneName,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
