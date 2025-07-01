import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class CorvusInfernoSquadronRaider extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0753794638',
            internalName: 'corvus#inferno-squadron-raider',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Attach a friendly pilot unit or upgrade to it',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => (card.isUnit() || card.isUpgrade()) && card.hasSomeTrait(Trait.Pilot),
                immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                    target: context.source,
                    upgrade: context.target,
                }))
            }
        });
    }
}
