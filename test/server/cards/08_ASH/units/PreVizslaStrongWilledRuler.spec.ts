describe('Pre Vizsla, Strong-Willed Ruler', function () {
    integration(function (contextRef) {
        it('should defeat 6 enemy units and create 6 Mandalorian tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#strongwilled-ruler'],
                    groundArena: ['porg', 'wampa'],
                    spaceArena: ['awing'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [
                        'atst',
                        'consular-security-force',
                        'jedha-agitator',
                        'death-star-stormtrooper',
                        'jawa-scavenger',
                        'snowspeeder'
                    ],
                    spaceArena: ['corellian-freighter', 'vanguard-ace', 'wing-leader', 'outland-tie-vanguard'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toHavePrompt('Choose any number of non-leader units with a total of 6 or less remaining HP');
            expect(context.player1).toHaveChooseNothingButton();

            expect(context.player1).toBeAbleToSelectExactly([
                context.preVizsla,
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.snowspeeder,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.jedhaAgitator);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.deathStarStormtrooper);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.vanguardAce);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
            ]);
            context.player1.clickCard(context.jawaScavenger);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
            ]);
            context.player1.clickCard(context.wingLeader);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
            ]);
            context.player1.clickCard(context.outlandTieVanguard);
            context.player1.clickCardNonChecking(context.porg);

            context.player1.clickPrompt('Done');

            context.player1.clickPrompt('Resolve all (6)');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(6);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

            expect(context.jedhaAgitator).toBeInZone('discard', context.player2);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player2);
            expect(context.vanguardAce).toBeInZone('discard', context.player2);
            expect(context.jawaScavenger).toBeInZone('discard', context.player2);
            expect(context.wingLeader).toBeInZone('discard', context.player2);
            expect(context.outlandTieVanguard).toBeInZone('discard', context.player2);

            expect(context.porg).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.corellianFreighter).toBeInZone('spaceArena', context.player2);
            expect(context.preVizsla).toBeInZone('groundArena', context.player1);
            expect(context.grandInquisitor).toBeInZone('groundArena', context.player1);
            expect(context.hanSolo).toBeInZone('groundArena', context.player2);
            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);
            expect(context.snowspeeder).toBeInZone('groundArena', context.player2);
        });

        it('should defeat 6 friendly units and create 6 Mandalorian tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#strongwilled-ruler'],
                    groundArena: [
                        'porg',
                        'wampa',
                        'jedha-agitator',
                        'death-star-stormtrooper',
                        'jawa-scavenger',
                    ],
                    spaceArena: ['awing', 'vanguard-ace', 'wing-leader', 'outland-tie-vanguard'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [
                        'atst',
                        'consular-security-force',
                        'snowspeeder'
                    ],
                    spaceArena: ['corellian-freighter'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toHavePrompt('Choose any number of non-leader units with a total of 6 or less remaining HP');
            expect(context.player1).toHaveChooseNothingButton();

            expect(context.player1).toBeAbleToSelectExactly([
                context.preVizsla,
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.snowspeeder,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.jedhaAgitator);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.deathStarStormtrooper);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.vanguardAce);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
            ]);
            context.player1.clickCard(context.jawaScavenger);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
            ]);
            context.player1.clickCard(context.wingLeader);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
            ]);
            context.player1.clickCard(context.outlandTieVanguard);

            context.player1.clickPrompt('Done');

            context.player1.clickPrompt('Resolve all (6)');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(6);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

            expect(context.jedhaAgitator).toBeInZone('discard', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);
            expect(context.vanguardAce).toBeInZone('discard', context.player1);
            expect(context.jawaScavenger).toBeInZone('discard', context.player1);
            expect(context.wingLeader).toBeInZone('discard', context.player1);
            expect(context.outlandTieVanguard).toBeInZone('discard', context.player1);

            expect(context.porg).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.corellianFreighter).toBeInZone('spaceArena', context.player2);
            expect(context.preVizsla).toBeInZone('groundArena', context.player1);
            expect(context.grandInquisitor).toBeInZone('groundArena', context.player1);
            expect(context.hanSolo).toBeInZone('groundArena', context.player2);
            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);
            expect(context.snowspeeder).toBeInZone('groundArena', context.player2);
        });

        it('should defeat Pre Vizsla and create 1 Mandalorian token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#strongwilled-ruler'],
                    groundArena: [
                        'porg',
                        'wampa',
                        'jedha-agitator',
                        'death-star-stormtrooper',
                        'jawa-scavenger',
                    ],
                    spaceArena: ['awing', 'vanguard-ace', 'wing-leader', 'outland-tie-vanguard'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [
                        'atst',
                        'consular-security-force',
                        'snowspeeder'
                    ],
                    spaceArena: ['corellian-freighter'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toHavePrompt('Choose any number of non-leader units with a total of 6 or less remaining HP');
            expect(context.player1).toHaveChooseNothingButton();

            expect(context.player1).toBeAbleToSelectExactly([
                context.preVizsla,
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.snowspeeder,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.preVizsla);

            expect(context.player1).toBeAbleToSelectExactly([context.preVizsla]);

            context.player1.clickPrompt('Done');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(1);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

            expect(context.preVizsla).toBeInZone('discard', context.player1);

            expect(context.jedhaAgitator).toBeInZone('groundArena', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
            expect(context.vanguardAce).toBeInZone('spaceArena', context.player1);
            expect(context.jawaScavenger).toBeInZone('groundArena', context.player1);
            expect(context.wingLeader).toBeInZone('spaceArena', context.player1);
            expect(context.outlandTieVanguard).toBeInZone('spaceArena', context.player1);
            expect(context.porg).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.corellianFreighter).toBeInZone('spaceArena', context.player2);
            expect(context.grandInquisitor).toBeInZone('groundArena', context.player1);
            expect(context.hanSolo).toBeInZone('groundArena', context.player2);
            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);
            expect(context.snowspeeder).toBeInZone('groundArena', context.player2);
        });

        it('should defeat one unit less than the maximum and create 1 Mandalorian token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#strongwilled-ruler'],
                    groundArena: [
                        'porg',
                        'wampa',
                        'jedha-agitator',
                        'death-star-stormtrooper',
                        'jawa-scavenger',
                    ],
                    spaceArena: ['awing', 'vanguard-ace', 'wing-leader', 'outland-tie-vanguard'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [
                        'atst',
                        'consular-security-force',
                        'snowspeeder'
                    ],
                    spaceArena: ['corellian-freighter'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toHavePrompt('Choose any number of non-leader units with a total of 6 or less remaining HP');
            expect(context.player1).toHaveChooseNothingButton();

            expect(context.player1).toBeAbleToSelectExactly([
                context.preVizsla,
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.snowspeeder,
                context.corellianFreighter
            ]);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([
                context.porg,
                context.wampa,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
            ]);

            context.player1.clickPrompt('Done');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(1);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

            expect(context.wampa).toBeInZone('discard', context.player1);

            expect(context.jedhaAgitator).toBeInZone('groundArena', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
            expect(context.vanguardAce).toBeInZone('spaceArena', context.player1);
            expect(context.jawaScavenger).toBeInZone('groundArena', context.player1);
            expect(context.wingLeader).toBeInZone('spaceArena', context.player1);
            expect(context.outlandTieVanguard).toBeInZone('spaceArena', context.player1);
            expect(context.porg).toBeInZone('groundArena', context.player1);
            expect(context.preVizsla).toBeInZone('groundArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.corellianFreighter).toBeInZone('spaceArena', context.player2);
            expect(context.grandInquisitor).toBeInZone('groundArena', context.player1);
            expect(context.hanSolo).toBeInZone('groundArena', context.player2);
            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);
            expect(context.snowspeeder).toBeInZone('groundArena', context.player2);
        });

        it('should defeat a unit that has more than 6 possible health but less than 6 remaining HP and create 1 Mandalorian token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#strongwilled-ruler'],
                    groundArena: [
                        'porg',
                        'wampa',
                        'jedha-agitator',
                        'death-star-stormtrooper',
                        'jawa-scavenger',
                    ],
                    spaceArena: ['awing', 'vanguard-ace', 'wing-leader', 'outland-tie-vanguard'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [
                        { card: 'atst', damage: 1 },
                        'consular-security-force',
                        'snowspeeder'
                    ],
                    spaceArena: ['corellian-freighter'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toHavePrompt('Choose any number of non-leader units with a total of 6 or less remaining HP');
            expect(context.player1).toHaveChooseNothingButton();

            expect(context.player1).toBeAbleToSelectExactly([
                context.preVizsla,
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.snowspeeder,
                context.corellianFreighter,
                context.atst
            ]);
            context.player1.clickCard(context.atst);

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);

            context.player1.clickPrompt('Done');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(1);
            expect(mandalorians).toAllBeInZone('groundArena');
            expect(mandalorians.every((m) => m.exhausted)).toBeTrue();

            expect(context.atst).toBeInZone('discard', context.player2);

            expect(context.jedhaAgitator).toBeInZone('groundArena', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
            expect(context.vanguardAce).toBeInZone('spaceArena', context.player1);
            expect(context.jawaScavenger).toBeInZone('groundArena', context.player1);
            expect(context.wingLeader).toBeInZone('spaceArena', context.player1);
            expect(context.outlandTieVanguard).toBeInZone('spaceArena', context.player1);
            expect(context.porg).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.corellianFreighter).toBeInZone('spaceArena', context.player2);
            expect(context.grandInquisitor).toBeInZone('groundArena', context.player1);
            expect(context.hanSolo).toBeInZone('groundArena', context.player2);
            expect(context.preVizsla).toBeInZone('groundArena', context.player1);
            expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);
            expect(context.snowspeeder).toBeInZone('groundArena', context.player2);
        });

        it('should not defeat lurking tie and also not make the token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#strongwilled-ruler'],
                    groundArena: [
                        'porg',
                        'wampa',
                        'jedha-agitator',
                        'death-star-stormtrooper',
                        'jawa-scavenger',
                    ],
                    spaceArena: ['awing', 'vanguard-ace', 'wing-leader', 'outland-tie-vanguard'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [
                        { card: 'atst', damage: 1 },
                        'consular-security-force',
                        'snowspeeder'
                    ],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toHavePrompt('Choose any number of non-leader units with a total of 6 or less remaining HP');
            expect(context.player1).toHaveChooseNothingButton();

            expect(context.player1).toBeAbleToSelectExactly([
                context.preVizsla,
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.snowspeeder,
                context.lurkingTiePhantom,
                context.atst
            ]);
            context.player1.clickCard(context.lurkingTiePhantom);
            context.player1.clickPrompt('Done');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(0);

            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.jedhaAgitator).toBeInZone('groundArena', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
            expect(context.vanguardAce).toBeInZone('spaceArena', context.player1);
            expect(context.jawaScavenger).toBeInZone('groundArena', context.player1);
            expect(context.wingLeader).toBeInZone('spaceArena', context.player1);
            expect(context.outlandTieVanguard).toBeInZone('spaceArena', context.player1);
            expect(context.porg).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena', context.player2);
            expect(context.grandInquisitor).toBeInZone('groundArena', context.player1);
            expect(context.hanSolo).toBeInZone('groundArena', context.player2);
            expect(context.preVizsla).toBeInZone('groundArena', context.player1);
            expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);
            expect(context.snowspeeder).toBeInZone('groundArena', context.player2);
        });

        it('should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pre-vizsla#strongwilled-ruler'],
                    groundArena: [
                        'porg',
                        'wampa',
                        'jedha-agitator',
                        'death-star-stormtrooper',
                        'jawa-scavenger',
                    ],
                    spaceArena: ['awing', 'vanguard-ace', 'wing-leader', 'outland-tie-vanguard'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [
                        { card: 'atst', damage: 1 },
                        'consular-security-force',
                        'snowspeeder'
                    ],
                    spaceArena: ['corellian-freighter'],
                    leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toHavePrompt('Choose any number of non-leader units with a total of 6 or less remaining HP');
            expect(context.player1).toHaveChooseNothingButton();

            expect(context.player1).toBeAbleToSelectExactly([
                context.preVizsla,
                context.porg,
                context.wampa,
                context.awing,
                context.jedhaAgitator,
                context.deathStarStormtrooper,
                context.vanguardAce,
                context.jawaScavenger,
                context.wingLeader,
                context.outlandTieVanguard,
                context.snowspeeder,
                context.corellianFreighter,
                context.atst
            ]);
            context.player1.clickPrompt('Choose nothing');

            const mandalorians = context.player1.findCardsByName('mandalorian');

            expect(mandalorians.length).toBe(0);

            expect(context.atst).toBeInZone('groundArena', context.player2);
            expect(context.jedhaAgitator).toBeInZone('groundArena', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
            expect(context.vanguardAce).toBeInZone('spaceArena', context.player1);
            expect(context.jawaScavenger).toBeInZone('groundArena', context.player1);
            expect(context.wingLeader).toBeInZone('spaceArena', context.player1);
            expect(context.outlandTieVanguard).toBeInZone('spaceArena', context.player1);
            expect(context.porg).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player1);
            expect(context.corellianFreighter).toBeInZone('spaceArena', context.player2);
            expect(context.grandInquisitor).toBeInZone('groundArena', context.player1);
            expect(context.hanSolo).toBeInZone('groundArena', context.player2);
            expect(context.preVizsla).toBeInZone('groundArena', context.player1);
            expect(context.consularSecurityForce).toBeInZone('groundArena', context.player2);
            expect(context.snowspeeder).toBeInZone('groundArena', context.player2);
        });
    });
});