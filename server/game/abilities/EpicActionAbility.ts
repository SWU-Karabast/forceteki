import { EpicActionLimit } from '../core/ability/AbilityLimit';
import { ActionAbility } from '../core/ability/ActionAbility';
import type { Card } from '../core/card/Card';
import type Game from '../core/Game';
import type { IEpicActionProps } from '../Interfaces';

export class EpicActionAbility extends ActionAbility {
    public constructor(game: Game, card: Card, properties: IEpicActionProps) {
        super(game, card, { ...properties, limit: new EpicActionLimit() });
    }

    public override isEpicAction(): this is EpicActionAbility {
        return true;
    }
}