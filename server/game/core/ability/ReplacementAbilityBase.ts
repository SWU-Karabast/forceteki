import { AbilityType } from '../Constants';
import type { ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import TriggeredAbility from './TriggeredAbility';
import type { Player } from '../Player';
import { ReplacementEffectContext } from './ReplacementEffectContext';
import type { AbilityContext } from './AbilityContext';
import * as Contract from '../utils/Contract';

export default class ReplacementAbilityBase extends TriggeredAbility {
    public constructor(game: Game, card: Card, triggeredAbilityProps: ITriggeredAbilityProps) {
        super(game, card, triggeredAbilityProps, AbilityType.ReplacementEffect);
    }

    protected override buildSubAbilityStepContext(subAbilityStepProps, canBeTriggeredBy: Player, parentContext: AbilityContext) {
        const context = super.buildSubAbilityStepContext(subAbilityStepProps, canBeTriggeredBy, parentContext);

        Contract.assertTrue(parentContext.isReplacement());

        return new ReplacementEffectContext({
            ...context.getProps(),
            event: (parentContext as any).event,
            replacementEffectWindow: (parentContext as ReplacementEffectContext).replacementEffectWindow
        });
    }
}
