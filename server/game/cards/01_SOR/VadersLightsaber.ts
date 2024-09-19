import AbilityHelper from '../../AbilityHelper';
import { Card } from '../../core/card/Card';
import { UpgradeCard } from '../../core/card/UpgradeCard';
import { CardType, KeywordName, Location, Trait, WildcardCardType } from '../../core/Constants';
import Player from '../../core/Player';

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
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.title === 'Darth Vader',
                trueImmediateEffect: this.vaderLightsaberAbility(),
                falseImmediateEffect: AbilityHelper.immediateEffects.noAction()
            })
        });
    }

    private vaderLightsaberAbility() {
        return AbilityHelper.immediateEffects.selectCard({
            locationFilter: Location.GroundArena,
            cardTypeFilter: WildcardCardType.Unit,
            innerSystem: AbilityHelper.immediateEffects.damage({ amount: 4 })
        });
    }
}

VadersLightsaber.implemented = true;
