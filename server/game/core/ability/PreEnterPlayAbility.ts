import type { IAbilityPropsWithSystems } from '../../Interfaces';
import type { Card } from '../card/Card';
import { AbilityType } from '../Constants';
import type Game from '../Game';
import type { AbilityContext } from './AbilityContext';
import { CardAbility } from './CardAbility';
import * as Contract from '../utils/Contract';

export default class PreEnterPlayAbility extends CardAbility {
    public constructor(
        game: Game,
        card: Card,
        properties: IAbilityPropsWithSystems<AbilityContext<Card>>
    ) {
        super(game, card, properties, AbilityType.Triggered);

        Contract.assertTrue(card.canRegisterPreEnterPlayAbilities(), `Card '${card.internalName}' cannot register pre-enter play abilities`);
    }
}