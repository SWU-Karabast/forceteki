import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';

export default class CaptainEnochCaptainOfTheGuard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9722568619',
            internalName: 'captain-enoch#captain-of-the-guard',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit gets +1/+0 for each Trooper unit in your discard pile',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.controller.discardZone.cards.filter((x) => x.isUnit() && x.hasSomeTrait(Trait.Trooper)).length,
                hp: 0,
            })),
        });
    }
}