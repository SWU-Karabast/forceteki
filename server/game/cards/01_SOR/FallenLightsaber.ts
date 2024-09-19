import AbilityHelper from '../../AbilityHelper';
import { Card } from '../../core/card/Card';
import { UpgradeCard } from '../../core/card/UpgradeCard';
import { CardType, KeywordName, Location, Trait, WildcardCardType } from '../../core/Constants';
import Player from '../../core/Player';

export default class FallenLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0160548661',
            internalName: 'fallen-lightsaber',
        };
    }

    public override canAttach(targetCard: Card, controller: Player = this.controller): boolean {
        if (targetCard.hasSomeTrait(Trait.Vehicle)) {
            return false;
        }

        return super.canAttach(targetCard, controller);
    }

    public override setupCardAbilities() {
        this.addGainTriggeredAbilityTargetingAttached({
            title: 'Deal 1 damage to each ground unit the defending player controls',
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => {
                return { target: context.source.controller.opponent.getUnitsInPlay(Location.GroundArena), amount: 1 };
            })
        },
        (context) => context.source.parentCard?.hasSomeTrait(Trait.Force));
    }
}

FallenLightsaber.implemented = true;
