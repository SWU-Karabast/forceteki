import type { AbilityContext } from '../core/ability/AbilityContext';
import { EpicActionLimit } from '../core/ability/AbilityLimit';
import { ActionAbility } from '../core/ability/ActionAbility';
import type { Card } from '../core/card/Card';
import type Game from '../core/Game';
import type { IEpicActionProps } from '../Interfaces';
import type { IMeetsRequirementsProperties } from '../core/ability/PlayerOrCardAbility';

export class EpicActionAbility extends ActionAbility {
    public constructor(game: Game, card: Card, properties: IEpicActionProps) {
        super(game, card, { ...properties, limit: new EpicActionLimit(game) });

        this.canResolveWithoutLegalTargets = true;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public override get isEpicAction(): boolean {
        return true;
    }

    public override meetsRequirements(context: AbilityContext, props: IMeetsRequirementsProperties = {}): string {
        const ignoredRequirements = [...(props.ignoredRequirements ?? []), 'gameStateChange'];
        const adjustedProps = {
            ...props,
            ignoredRequirements
        };
        return super.meetsRequirements(context, adjustedProps);
    }
}