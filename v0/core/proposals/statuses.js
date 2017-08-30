const moment = require("moment");
const runcli = require("../core-utils").runCliCmd;

module.exports.addListStatuses = async proposalsList => {
  let newList = Object.assign({}, proposalsList);
  const lastSuperblockTime = getLastSuperblockTime();
  Object.entries(proposalsList).forEach(async ([hash, proposal]) => {
    newList[hash].status = await getProposalStatus(
      proposal,
      lastSuperblockTime
    );
  });
  return newList;
};

async function getProposalStatus(
  proposal,
  lastSuperblockTime = getLastSuperblockTime()
) {
  const isActive = isProposalActive(proposal, lastSuperblockTime);
  const isClosed = isProposalClosed(proposal);
  if (isClosed) return "closed";
  else if (isActive) return "active";
  else return "passed";
}
module.exports.getProposalStatus = getProposalStatus;

function isProposalActive(
  proposal,
  lastSuperblockTime = getLastSuperblockTime()
) {
  const ds = JSON.parse(proposal.DataString)[0][1];
  if (
    (lastSuperblockTime < proposal.CreationTime &&
      moment()
        .subtract(24, "hours")
        .isAfter(proposal.CreationTime * 1000)) ||
    moment().isBefore(ds.end_epoch * 1000)
  )
    return true;
  else return false;
}

function isProposalClosed(proposal) {
  // TODO when database exists, save flag there
  return false;
}

// Not the best place for this function
async function getLastSuperblockTime() {
  const govinfo = await runcli("getgovernanceinfo");
  const lastSuperblockHash = await runcli([
    "getblockhash",
    govinfo.lastsuperblock
  ]);
  const lastSuperblock = await runcli(["getblock", lastSuperblockHash]);
  return lastSuperblock.time;
}
