import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class FettsFiresprayFearedSilhouette extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6648978613',
            internalName: 'fetts-firespray#feared-silhouette',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 1 indirect damage to a player. If you control Boba Fett, deal 2 indirect damage instead',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
                onCardPlayed: (event, context) => event.card === context.source
            },
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.controlsLeaderOrUnitWithTitle('Boba Fett'),
                    onTrue: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 2 }),
                    onFalse: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 1 }),
                })
            }
        });
    }
}
