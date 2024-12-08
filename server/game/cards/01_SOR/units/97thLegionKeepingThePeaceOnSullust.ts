import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class _97thLegionKeepingThePeaceOnSullust extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7648077180',
            internalName: '97th-legion#keeping-the-peace-on-sullust',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit gets +1/+1 for each resource you control.',
            ongoingEffect: OngoingEffectBuilder.card.dynamic(EffectName.ModifyStats, function (target, context) {
                return {
                    power: context.source.controller.resources.length,
                    hp: context.source.controller.resources.length,
                };
            }),
        });
    }
}

_97thLegionKeepingThePeaceOnSullust.implemented = true;
