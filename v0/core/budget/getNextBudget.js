const runcli = require("../core-utils").runCliCmd;
const moment = require("moment");

module.exports = async () => {
  const lockedBlocks = 1662; // https://dashpay.atlassian.net/wiki/spaces/DOC/pages/19169430/Using+Decentralized+Governance+Proposals+Voting+and+Budgets

  const govinfo = await runcli("getgovernanceinfo");
  const latestHash = await runcli("getbestblockhash");
  const latestBlock = await runcli(["getblock", latestHash]);
  const oldBlockHeight = latestBlock.height - govinfo.superblockcycle;
  const oldBlockHash = await runcli(["getblockhash", oldBlockHeight]);
  const oldBlock = await runcli(["getblock", oldBlockHash]);
  const budgetTotal = await runcli([
    "getsuperblockbudget",
    govinfo.nextsuperblock
  ]);

  const blocktimeSec =
    (latestBlock.time - oldBlock.time) / govinfo.superblockcycle;
  const paymentDelay =
    (govinfo.nextsuperblock - latestBlock.height) * blocktimeSec;
  const paymentDate = moment(latestBlock.time * 1000).add(
    paymentDelay,
    "seconds"
  );
  const voteDeadlineDelay =
    (govinfo.nextsuperblock - latestBlock.height - lockedBlocks) * blocktimeSec;
  const voteDeadlineDate = moment(latestBlock.time * 1000).add(
    voteDeadlineDelay,
    "seconds"
  );
  const superblockHeight = govinfo.nextsuperblock;

  return {
    blocktimeSec,
    paymentDelay,
    paymentDate,
    voteDeadlineDelay,
    voteDeadlineDate,
    superblockHeight,
    budgetTotal
  };
};
