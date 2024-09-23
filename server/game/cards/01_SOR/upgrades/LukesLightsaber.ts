import AbilityHelper from '../../../AbilityHelper';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import Player from '../../../core/Player';

export default class LukesLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6903722220',
            internalName: 'lukes-lightsaber',
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
            title: 'Heal all damage from Luke and give him a shield token',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context: TriggeredAbilityContext<this>) => ({
                target: context.source.parentCard,
                condition: context.source.parentCard?.title === 'Luke Skywalker',
                onTrue: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.heal({ amount: context.source.parentCard.damage }),
                    AbilityHelper.immediateEffects.giveShield()]),
                onFalse: AbilityHelper.immediateEffects.noAction()
            }))
        });
    }
}

LukesLightsaber.implemented = true;
