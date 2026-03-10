import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class AhsokasLightsabersDontHurtThem extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6723800914',
            internalName: 'ahsokas-lightsabers#dont-hurt-them',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        this.disableWhenDefeatedCheck = true;

        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Give a Shield token to an enemy unit. If you do, the next event you play this phase costs 2 resources less.',
            when: {
                onAttack: true,
                whenDefeated: true,
            },
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            },
            ifYouDo: {
                title: 'The next event you play this phase costs 2 resources less',
                immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                    effect: AbilityHelper.ongoingEffects.decreaseCost({
                        cardTypeFilter: CardType.Event,
                        limit: AbilityHelper.limit.perPlayerPerGame(1),
                        amount: 2
                    })
                })
            }
        });
    }
}