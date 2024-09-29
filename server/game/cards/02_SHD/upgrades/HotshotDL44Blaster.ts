import AbilityHelper from '../../../AbilityHelper';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PlayType, Trait } from '../../../core/Constants';
import Player from '../../../core/Player';

export default class HotshotDL44Blaster extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5874342508',
            internalName: 'hotshot-dl44-blaster',
        };
    }

    public override canAttach(targetCard: Card, controller: Player = this.controller): boolean {
        if (targetCard.hasSomeTrait(Trait.Vehicle)) {
            return false;
        }

        return super.canAttach(targetCard, controller);
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'When Smuggled, attack with attached unit',
            optional: false,
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                target: context.source.parentCard,
                condition: context.event.playType === PlayType.Smuggle,
                onTrue: AbilityHelper.immediateEffects.attack((context) => ({
                    attacker: context.source.parentCard,
                    optional: false
                })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            }))
        });
    }
}

HotshotDL44Blaster.implemented = true;