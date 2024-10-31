import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Ruthlessness extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4897501399',
            internalName: 'ruthlessness',
        };
    }

    public override setupCardAbilities() {
        this.addGainTriggeredAbilityTargetingAttached({
            title: 'Deal 2 damage to the defending player’s base',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttackerDamage &&
                    event.defeatSource.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.source.controller.opponent.base
            }))
        });
    }
}

Ruthlessness.implemented = true;
