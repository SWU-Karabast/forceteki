import { EpicAction } from './EpicAction';
import { Exhaust } from './Exhaust';
import { Hp } from './Hp';
import { NewCard } from './NewCard';

export const HpCard = Hp(NewCard);

export const HpExhaust = Exhaust(Hp(NewCard));

export const Base = EpicAction(Hp(NewCard));

// epic action

// make sure that exhaust is at the beginning of the inheritance chain so we can
// use it when resourcing
// so like:
// DrawCard = NewCard -> no stats, use this in hand / deck
// ResourcedCard = Exhaustible(DrawCard)
// Unit = HasHp(HasPower(ResourceCard))

// where in the chain does this 'isResource' flag go? top of it?