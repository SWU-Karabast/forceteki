import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import Player from '../Player';


export class NewCard extends OngoingEffectSource {
    public override readonly id: string;

    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game);
    }
}