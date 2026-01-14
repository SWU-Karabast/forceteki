describe('Malakili, Keeper of the Menagerie\'s constant ability', function () {
    integration(function (contextRef) {
        describe('Friendly Creature units in play', function () {
            it('gain the Underworld trait for the purposes of targeting effects (Xanadu Blood)', async function () {});
            it('gain the Underworld trait for the purposes of targeting effects (SHD Maul)', async function () {});
        });

        describe('Friendly Creature units in hand', function () {
            it('gain the Underworld trait for the purposes of When Played effects (Cad Bane)', async function () {});
            
            // TODO: Implement this test when LAW Jabba the Hutt leader is implemented
            // it('gain the Underworld trait for the purposes of targeting effects', async function () {
            //     // Jabba's unit side action ability should be able to target Creature units when Malakili is in play
            // });
        });

        describe('Friendly Creature units in the discard pile', function () {
            it('gain the Underworld trait for the purposes of targeting effects (Street Gang Recruiter)', async function () {});
            it('gain the Underworld trait for the purposes of targeting effects (LAW Doctor Aphra)', async function () {});
        });

        describe('Friendly Creature units in the deck', function () {
            it('gain the Underworld trait for the purposes of When Played effects (Ezra Bridger)', async function () {});
        });

        describe('Enemy Creature units', function () {
        });
    }
});