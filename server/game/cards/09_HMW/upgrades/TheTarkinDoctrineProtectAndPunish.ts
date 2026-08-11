import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IBaseCard } from '../../../core/card/BaseCard';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class TheTarkinDoctrineProtectAndPunish extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'the-tarkin-doctrine#protect-and-punish-id',
            internalName: 'the-tarkin-doctrine#protect-and-punish',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        // Attached base gains: "When you play a Fortification upgrade: Exhaust an enemy unit."
        registrar.addGainTriggeredAbilityTargetingAttached<IBaseCard>({
            title: 'Exhaust an enemy unit',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    event.card.isUpgrade() &&
                    event.card.hasSomeTrait(Trait.Fortification),
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            },
        });

        // When Played: If you control Grand Moff Tarkin, give an enemy unit -3/-0 for this phase.
        // (The controller condition is dropped from the title, per convention for conditional abilities.)
        registrar.addWhenPlayedAbility({
            title: 'Give an enemy unit -3/-0 for this phase',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Grand Moff Tarkin'),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 }),
                    }),
                }),
            },
        });
    }
}
