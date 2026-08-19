import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
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
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Exhaust an enemy unit',
            gainCondition: (context) => context.source.parentCard?.isBase(),
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
