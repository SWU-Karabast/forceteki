import AbilityHelper from '../../../AbilityHelper';
import { AbilityContext } from '../../../core/ability/AbilityContext';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType, KeywordName, Location, Trait, WildcardCardType } from '../../../core/Constants';
import Player from '../../../core/Player';

export default class VadersLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0705773109',
            internalName: 'vaders-lightsaber',
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
            title: 'Deal 4 damage to a ground unit',
            optional: true,
            targetResolver: {
                locationFilter: Location.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context: TriggeredAbilityContext<this>) => context.source.parentCard?.title === 'Darth Vader',      // TODO THIS PR: can we make this cast go away?
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 4 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

VadersLightsaber.implemented = true;
