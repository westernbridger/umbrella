const { Memory } = require('./memoryHandler');
const { getOrCreateMemory, addFact } = require('../../utils/memory');

async function ensureMemberSession(client, memberId, groupId, botId) {
  if (memberId === botId) return true;
  const hasDm = await Memory.exists({ userId: memberId, chatId: memberId });
  const userMem = await getOrCreateMemory(memberId);
  const flagKey = `setupPrompted_${groupId}`;
  const prompted = userMem.memory && userMem.memory[flagKey];
  if (!hasDm && !prompted) {
    await client.sendText(
      memberId,
      'Hey, I need a quick reply here to finish setup for group chat features! Please say hi.'
    );
    await addFact(memberId, flagKey, true);
  }
  return hasDm;
}

async function processGroup(client, groupId, botId) {
  try {
    const members = await client.getGroupMembersId(groupId);
    let missing = [];
    for (const id of members) {
      const ok = await ensureMemberSession(client, id, groupId, botId);
      if (!ok) missing.push(id);
    }
    if (missing.length) {
      await client.sendText(
        groupId,
        'Not all group members have completed bot setup. Please reply to my DM to enable group features.'
      );
    }
  } catch (err) {
    console.error('[GROUP INIT]', err.message);
  }
}

module.exports = { processGroup };
