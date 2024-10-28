import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KraganGorrWarbirdCaptain extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7674544152',
            internalName: 'kragan-gorr#warbird-captain'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Give a Shield token to a friendly unit in the same arena as the attacker',
            when: {
                onAttackDeclared: (event, context) => event.attack.target === context.source.controller.base,
            },
            targetResolver: {
                cardCondition: (card, context) => card.controller === context.source.controller && card.location === context.event.attack.attacker.location,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}

KraganGorrWarbirdCaptain.implemented = true;
