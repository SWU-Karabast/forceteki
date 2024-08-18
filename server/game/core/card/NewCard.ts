import { IActionProps } from '../../Interfaces';
import { CardActionAbility } from '../ability/CardActionAbility';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';
import Contract from '../utils/Contract';
import Card from './Card';

export type CardConstructor = new (...args: any[]) => NewCard;

export class NewCard extends OngoingEffectSource {
    protected override readonly id: string;
    protected _actions: PlayerOrCardAbility[] = [];

    public get actions() {
        return this._actions;
    }

    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game);

        this.id = cardData.id;
    }

    protected unpackConstructorArgs(...args: any[]): [Player, any] {
        Contract.assertArraySize(args, 2);

        return [args[0] as Player, args[1]];
    }
}