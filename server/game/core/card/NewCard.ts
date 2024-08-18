import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';
import Contract from '../utils/Contract';

export type CardConstructor = new (...args: any[]) => NewCard;

export class NewCard extends OngoingEffectSource {
    protected override id: string;

    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game);
    }

    protected unpackConstructorArgs(...args: any[]): [Player, any] {
        Contract.assertArraySize(args, 2);

        return [args[0] as Player, args[1]];
    }
}