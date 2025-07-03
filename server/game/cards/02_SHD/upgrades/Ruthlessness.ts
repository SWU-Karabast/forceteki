import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class Ruthlessness extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4897501399',
            internalName: 'ruthlessness',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addGainTriggeredAbilityTargetingAttached({
            title: 'Deal 2 damage to the defending player’s base',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.player.opponent.base
            }))
        });
    }
}
